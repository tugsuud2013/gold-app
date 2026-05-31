import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SellRequestStatus } from '@prisma/client';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';

const SELL_REQUEST_USER_SELECT = {
  firstName: true,
  lastName: true,
  phoneNumber: true,
  membershipLevel: true,
} as const;

const sellRequestWithUserInclude = {
  user: { select: SELL_REQUEST_USER_SELECT },
} as const;

@Injectable()
export class SellRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly membershipService: MembershipService,
  ) {}

  async createSellRequest(userId: string, dto: CreateSellRequestDto) {
    if (!Number.isInteger(dto.amountGrams * 2)) {
      throw new BadRequestException({
        message: 'amountGrams must be in 0.5 step',
        errorCode: 'INVALID_SELL_AMOUNT',
      });
    }
    const wallet = await this.walletService.getWalletByUserId(userId);
    if (wallet.balanceGrams.lt(dto.amountGrams)) {
      throw new BadRequestException({
        message: 'Insufficient balance',
        errorCode: 'INSUFFICIENT_BALANCE',
      });
    }

    return this.prisma.sellRequest.create({
      data: {
        userId,
        amountGrams: dto.amountGrams,
        status: SellRequestStatus.PENDING,
        adminNote: dto.note ?? null,
      },
    });
  }

  async getSellRequestHistory(userId: string) {
    return this.prisma.sellRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSellRequests(status?: SellRequestStatus, userId?: string) {
    return this.prisma.sellRequest.findMany({
      where: {
        status: status ?? undefined,
        userId: userId ?? undefined,
      },
      include: sellRequestWithUserInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSellRequestById(requestId: string) {
    const req = await this.prisma.sellRequest.findUnique({
      where: { id: requestId },
      include: sellRequestWithUserInclude,
    });
    if (!req) {
      throw new NotFoundException({
        message: 'Sell request not found',
        errorCode: 'SELL_REQUEST_NOT_FOUND',
      });
    }
    return req;
  }

  async getSellRequestStats(userId?: string) {
    const where: Prisma.SellRequestWhereInput = {
      userId: userId ?? undefined,
    };

    const [total, pending, approved, completed, cancelled] = await Promise.all([
      this.prisma.sellRequest.count({ where }),
      this.prisma.sellRequest.count({ where: { ...where, status: SellRequestStatus.PENDING } }),
      this.prisma.sellRequest.count({ where: { ...where, status: SellRequestStatus.APPROVED } }),
      this.prisma.sellRequest.count({ where: { ...where, status: SellRequestStatus.COMPLETED } }),
      this.prisma.sellRequest.count({ where: { ...where, status: SellRequestStatus.CANCELLED } }),
    ]);

    return { total, pending, approved, completed, cancelled };
  }

  async approveSellRequest(requestId: string, adminId: string) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id: requestId } });
    if (!req) {
      throw new NotFoundException({
        message: 'Sell request not found',
        errorCode: 'SELL_REQUEST_NOT_FOUND',
      });
    }
    return this.prisma.sellRequest.update({
      where: { id: requestId },
      data: {
        status: SellRequestStatus.APPROVED,
        processedBy: adminId,
        approvedAt: new Date(),
      },
      include: sellRequestWithUserInclude,
    });
  }

  async completeSellRequest(requestId: string, adminId: string) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id: requestId } });
    if (!req) {
      throw new NotFoundException({
        message: 'Sell request not found',
        errorCode: 'SELL_REQUEST_NOT_FOUND',
      });
    }
    if (req.status !== SellRequestStatus.APPROVED) {
      throw new BadRequestException({
        message: 'Sell request must be APPROVED first',
        errorCode: 'INVALID_SELL_REQUEST_STATUS',
      });
    }

    await this.walletService.deductGrams(
      req.userId,
      req.amountGrams.toString(),
      req.id,
      'Алт зарах',
    );
    await this.membershipService.checkAndUpdateMembership(req.userId);

    return this.prisma.sellRequest.update({
      where: { id: requestId },
      data: {
        status: SellRequestStatus.COMPLETED,
        processedBy: adminId,
        completedAt: new Date(),
      },
      include: sellRequestWithUserInclude,
    });
  }

  async cancelSellRequest(requestId: string, adminId: string, note?: string) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id: requestId } });
    if (!req) {
      throw new NotFoundException({
        message: 'Sell request not found',
        errorCode: 'SELL_REQUEST_NOT_FOUND',
      });
    }
    return this.prisma.sellRequest.update({
      where: { id: requestId },
      data: {
        status: SellRequestStatus.CANCELLED,
        processedBy: adminId,
        adminNote: note ?? null,
      },
      include: sellRequestWithUserInclude,
    });
  }
}
