import {
  Body,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { KycVerifiedGuard } from '../common/guards/kyc-verified.guard';
import { successResponse } from '../common/response.helper';
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
@ApiTags('Purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  private getUserId(user: AuthenticatedUser | undefined): string {
    if (!user || user.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get('calculate')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async calculatePrice(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('amountGrams', ParseFloatPipe) amountGrams: number,
  ) {
    this.getUserId(user);
    const data = await this.purchaseService.calculatePrice(amountGrams);
    return successResponse('Purchase price calculated', data);
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async initiatePurchase(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: InitiatePurchaseDto,
  ) {
    const data = await this.purchaseService.initiatePurchase(this.getUserId(user), dto);
    return successResponse('Purchase initiated', data);
  }

  @Post(':id/sign-contract')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async signContract(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') purchaseId: string,
  ) {
    const data = await this.purchaseService.signContract(this.getUserId(user), purchaseId);
    return successResponse('Contract signed', data);
  }

  @Get(':id/contract')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async getContract(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') purchaseId: string,
    @Res() res: Response,
  ) {
    await this.purchaseService.getPurchaseById(this.getUserId(user), purchaseId);
    const path = join(process.cwd(), 'uploads', 'contracts', `${purchaseId}.pdf`);
    return res.sendFile(path);
  }

  @Post(':id/create-invoice')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async createInvoice(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') purchaseId: string,
  ) {
    const data = await this.purchaseService.createQpayInvoice(this.getUserId(user), purchaseId);
    return successResponse('QPay invoice created', data);
  }

  @Get(':id/payment-status')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async getPaymentStatus(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') purchaseId: string,
  ) {
    const data = await this.purchaseService.getPaymentStatus(this.getUserId(user), purchaseId);
    return successResponse('Payment status fetched', data);
  }

  @Post('qpay-webhook')
  async qpayWebhook(@Body() payload: Record<string, unknown>) {
    const data = await this.purchaseService.handleQpayWebhook(payload);
    return successResponse('Webhook processed', data);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async getHistory(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.purchaseService.getPurchaseHistory(
      this.getUserId(user),
      Number(page ?? 1),
      Number(limit ?? 20),
    );
    return successResponse('Purchase history fetched', data);
  }
}
