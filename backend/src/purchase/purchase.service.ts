import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus, Prisma, PurchaseStatus, QpayStatus } from '@prisma/client';
import QRCode from 'qrcode';
import { ContractService } from '../contract/contract.service';
import { GoldPriceService } from '../gold-price/gold-price.service';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { QpayService } from '../qpay/qpay.service';
import { WalletService } from '../wallet/wallet.service';
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldPriceService: GoldPriceService,
    private readonly contractService: ContractService,
    private readonly qpayService: QpayService,
    private readonly walletService: WalletService,
    private readonly membershipService: MembershipService,
  ) {}

  private validatePurchaseAmount(amountGrams: number): void {
    if (amountGrams < 0.5 || amountGrams > 10) {
      throw new BadRequestException({
        message: 'amountGrams must be between 0.5 and 10',
        errorCode: 'INVALID_PURCHASE_AMOUNT',
      });
    }
    if (!Number.isInteger(amountGrams * 2)) {
      throw new BadRequestException({
        message: 'amountGrams must be in 0.5 step',
        errorCode: 'INVALID_PURCHASE_STEP',
      });
    }
  }

  async calculatePrice(amountGrams: number) {
    this.validatePurchaseAmount(amountGrams);
    const current = await this.goldPriceService.getCurrentPrice();
    if (!current) {
      throw new NotFoundException({
        message: 'Gold price not found',
        errorCode: 'GOLD_PRICE_NOT_FOUND',
      });
    }

    const amount = new Prisma.Decimal(amountGrams);
    const total = amount.mul(current.pricePerGram);

    return {
      amountGrams: amount,
      pricePerGram: current.pricePerGram,
      totalAmountMnt: total,
    };
  }

  async initiatePurchase(userId: string, dto: InitiatePurchaseDto) {
    this.validatePurchaseAmount(dto.amountGrams);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.kycStatus !== KycStatus.VERIFIED) {
      throw new ForbiddenException({
        message: 'KYC баталгаажаагүй байна',
        errorCode: 'KYC_NOT_VERIFIED',
      });
    }

    const price = await this.calculatePrice(dto.amountGrams);
    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        amountGrams: price.amountGrams,
        pricePerGram: price.pricePerGram,
        totalAmountMnt: price.totalAmountMnt,
        status: PurchaseStatus.PENDING,
      },
    });

    return {
      ...purchase,
      priceDetails: price,
    };
  }

  async signContract(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundException({
        message: 'Purchase not found',
        errorCode: 'PURCHASE_NOT_FOUND',
      });
    }
    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException({
        message: 'Purchase is not in PENDING state',
        errorCode: 'INVALID_PURCHASE_STATUS',
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const contractPdfPath = await this.contractService.generateContract(
      {
        id: purchase.id,
        amountGrams: purchase.amountGrams.toString(),
        pricePerGram: purchase.pricePerGram.toString(),
        totalAmountMnt: purchase.totalAmountMnt.toString(),
      },
      {
        fullName: `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim(),
        registerNumber: user.registerNumber ?? '-',
        phoneNumber: user.phoneNumber,
        signatureImageUrl: user.signatureImageUrl,
      },
    );

    const qrCodeData = await QRCode.toDataURL(
      `CONTRACT:${purchase.id}:${new Date().toISOString()}`,
    );
    await this.contractService.addQrCodeToPdf(contractPdfPath, qrCodeData);

    const relative = `/uploads/contracts/${purchase.id}.pdf`;
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        contractPdfUrl: relative,
        contractQrCode: qrCodeData,
        status: PurchaseStatus.CONTRACT_SIGNED,
      },
    });

    return {
      purchaseId: purchase.id,
      contractPdfUrl: relative,
      contractQrCode: qrCodeData,
    };
  }

  async createQpayInvoice(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundException({
        message: 'Purchase not found',
        errorCode: 'PURCHASE_NOT_FOUND',
      });
    }
    if (purchase.status !== PurchaseStatus.CONTRACT_SIGNED) {
      throw new BadRequestException({
        message: 'Purchase must be CONTRACT_SIGNED',
        errorCode: 'INVALID_PURCHASE_STATUS',
      });
    }

    const invoice = await this.qpayService.createInvoice(
      purchase.id,
      purchase.totalAmountMnt.toNumber(),
      'Алт худалдан авалт',
    );

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        qpayInvoiceId: String(invoice.invoice_id),
        status: PurchaseStatus.PAYMENT_PENDING,
      },
    });

    return invoice;
  }

  async handleQpayWebhook(payload: Record<string, unknown>) {
    const invoiceId = String(payload.invoice_id ?? payload.invoiceId ?? '');
    if (!invoiceId) {
      throw new BadRequestException({
        message: 'invoice_id is required',
        errorCode: 'INVALID_WEBHOOK_PAYLOAD',
      });
    }

    const purchase = await this.prisma.purchase.findFirst({
      where: { qpayInvoiceId: invoiceId },
    });
    if (!purchase) {
      throw new NotFoundException({
        message: 'Purchase not found for invoice',
        errorCode: 'PURCHASE_NOT_FOUND',
      });
    }

    const payment = await this.qpayService.checkPayment(invoiceId);
    const isPaid = Boolean(payment?.paid || payment?.payment_status === 'PAID');
    if (!isPaid) {
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: { qpayStatus: QpayStatus.PENDING },
      });
      return { success: true, paid: false };
    }

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        qpayStatus: QpayStatus.PAID,
        paidAt: new Date(),
        status: PurchaseStatus.COMPLETED,
      },
    });

    await this.walletService.addGrams(
      purchase.userId,
      purchase.amountGrams.toString(),
      purchase.id,
      'Алт худалдан авалт',
    );
    await this.membershipService.checkAndUpdateMembership(purchase.userId);

    return { success: true, paid: true };
  }

  async getPurchaseHistory(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const [items, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.purchase.count({ where: { userId } }),
    ]);
    return { page: safePage, limit: safeLimit, total, items };
  }

  async getPurchaseById(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundException({
        message: 'Purchase not found',
        errorCode: 'PURCHASE_NOT_FOUND',
      });
    }
    return purchase;
  }

  async getPaymentStatus(userId: string, purchaseId: string) {
    const purchase = await this.getPurchaseById(userId, purchaseId);
    return {
      purchaseId: purchase.id,
      qpayStatus: purchase.qpayStatus,
      status: purchase.status,
      paidAt: purchase.paidAt,
    };
  }
}
