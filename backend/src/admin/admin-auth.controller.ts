import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { successResponse } from '../common/response.helper';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin/auth')
@ApiTags('Admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    const data = await this.adminAuthService.login(dto);
    return successResponse('Admin login successful', data);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async register(@Body() dto: CreateAdminDto) {
    const data = await this.adminAuthService.createAdmin(dto);
    return successResponse('Admin created', data);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  @ApiBearerAuth()
  async changePassword(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ChangeAdminPasswordDto,
  ) {
    const adminId = user?.id ?? '';
    const data = await this.adminAuthService.changePassword(adminId, dto);
    return successResponse('Password changed', data);
  }
}
