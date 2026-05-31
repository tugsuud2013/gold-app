import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class QpayService {
  private readonly api: AxiosInstance;
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {
    this.api = axios.create({
      baseURL: 'https://merchant.qpay.mn/v2',
      timeout: 15000,
    });
  }

  async login(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    const username = this.configService.get<string>('QPAY_USERNAME') ?? '';
    const password = this.configService.get<string>('QPAY_PASSWORD') ?? '';

    try {
      const response = await this.api.post('/auth/token', {
        username,
        password,
      });
      const accessToken = response.data?.access_token as string | undefined;
      if (!accessToken) {
        throw new Error('No QPay token');
      }
      this.token = accessToken;
      this.tokenExpiresAt = Date.now() + (55 * 60 * 1000);
      return accessToken;
    } catch {
      throw new InternalServerErrorException({
        message: 'QPay login failed',
        errorCode: 'QPAY_LOGIN_FAILED',
      });
    }
  }

  async createInvoice(
    purchaseId: string,
    amountMnt: number | string,
    description: string,
  ) {
    const token = await this.login();
    const invoiceCode = this.configService.get<string>('QPAY_INVOICE_CODE') ?? '';
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL') ?? 'http://localhost:3000';

    try {
      const response = await this.api.post(
        '/invoice',
        {
          invoice_code: invoiceCode,
          sender_invoice_no: purchaseId,
          invoice_receiver_code: 'terminal',
          invoice_description: description,
          amount: Number(amountMnt),
          callback_url: `${apiBaseUrl}/api/purchase/qpay-webhook`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return {
        invoice_id: response.data?.invoice_id,
        qr_text: response.data?.qr_text,
        qr_image: response.data?.qr_image,
        urls: response.data?.urls ?? [],
      };
    } catch {
      throw new InternalServerErrorException({
        message: 'QPay invoice creation failed',
        errorCode: 'QPAY_INVOICE_FAILED',
      });
    }
  }

  async checkPayment(invoiceId: string) {
    const token = await this.login();
    try {
      const response = await this.api.get(`/payment/check/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch {
      throw new InternalServerErrorException({
        message: 'QPay payment check failed',
        errorCode: 'QPAY_CHECK_FAILED',
      });
    }
  }
}
