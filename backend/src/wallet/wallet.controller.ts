import {
  Controller,
  Get,
  UnauthorizedException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/response.helper';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiTags('Wallet')
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private getUserId(user: AuthenticatedUser | undefined): string {
    if (!user || user.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get('balance')
  async getBalance(@CurrentUser() user: AuthenticatedUser | undefined) {
    const userId = this.getUserId(user);
    const data = await this.walletService.getWalletByUserId(userId);
    return successResponse('Wallet balance fetched', data);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(user);
    const data = await this.walletService.getTransactions(
      userId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
    return successResponse('Wallet transactions fetched', data);
  }
}
