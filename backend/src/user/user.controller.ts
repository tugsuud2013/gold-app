import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { successResponse } from '../common/response.helper';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getUserId(user: AuthenticatedUser | undefined): string {
    if (!user || user.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser | undefined) {
    const data = await this.userService.getProfile(this.getUserId(user));
    return successResponse('Profile fetched', data);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.userService.updateProfile(this.getUserId(user), dto);
    return successResponse('Profile updated', data);
  }

  @Post('kyc')
  async submitKyc(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateKycDto,
  ) {
    const data = await this.userService.submitKyc(this.getUserId(user), dto);
    return successResponse('KYC submitted', data);
  }

  @Get('kyc-status')
  async getKycStatus(@CurrentUser() user: AuthenticatedUser | undefined) {
    const data = await this.userService.getKycStatus(this.getUserId(user));
    return successResponse('KYC status fetched', data);
  }

  @Put('change-password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ChangePasswordDto,
  ) {
    const data = await this.userService.changePassword(this.getUserId(user), dto);
    return successResponse('Password changed', data);
  }

  @Put('push-token')
  async updatePushToken(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdatePushTokenDto,
  ) {
    const data = await this.userService.updatePushToken(this.getUserId(user), dto.pushToken);
    return successResponse('Push token updated', data);
  }
}
