import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, UserStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { successResponse } from '../common/response.helper';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin/admins')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminManageController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  private getAdmin(user: AuthenticatedUser | undefined) {
    if (!user || user.kind !== 'admin') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user;
  }

  @Get()
  async getAdmins() {
    const data = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse('Admin users fetched', data);
  }

  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    const data = await this.adminAuthService.createAdmin(dto);
    return successResponse('Admin created', data);
  }

  @Put(':id')
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const data = await this.prisma.adminUser.update({
      where: { id },
      data: {
        email: dto.email?.toLowerCase(),
        name: dto.name,
        role: dto.role,
        status: dto.status,
      },
    });
    return successResponse('Admin updated', data);
  }

  @Delete(':id')
  async deleteAdmin(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    const actor = this.getAdmin(user);
    if (actor.id === id) {
      throw new BadRequestException({
        message: 'Cannot delete own account',
        errorCode: 'CANNOT_DELETE_SELF',
      });
    }
    const data = await this.prisma.adminUser.update({
      where: { id },
      data: { status: UserStatus.DELETED },
    });
    return successResponse('Admin deleted', data);
  }
}
