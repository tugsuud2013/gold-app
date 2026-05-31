import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/response.helper';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './types/authenticated-user.type';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return successResponse('Registration successful', data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return successResponse('Login successful', data);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    const data = await this.authService.sendOtp(dto.phoneNumber);
    return successResponse('OTP sent', data);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const data = await this.authService.verifyOtp(dto);
    return successResponse('OTP verified', data);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refreshToken(dto);
    return successResponse('Token refreshed', data);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AuthenticatedUser | undefined) {
    if (user?.kind === 'user') {
      const data = await this.authService.logout(user.id);
      return successResponse('Logged out', data);
    }
    return successResponse('Logged out', { loggedOut: true });
  }
}
