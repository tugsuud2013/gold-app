import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { successResponse } from '../common/response.helper';
import { UpdateSettingsSectionDto } from './dto/update-settings-section.dto';
import { SETTINGS_SECTIONS, type SettingsSection } from './settings.defaults';
import { SettingsService } from './settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  private getAdmin(user: AuthenticatedUser | undefined) {
    if (!user || user.kind !== 'admin') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user;
  }

  private getIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
    return req.ip;
  }

  private assertSection(section: string): SettingsSection {
    if (!SETTINGS_SECTIONS.includes(section as SettingsSection)) {
      throw new BadRequestException({
        message: 'Invalid settings section',
        errorCode: 'INVALID_SETTINGS_SECTION',
      });
    }
    return section as SettingsSection;
  }

  @Get()
  async getAll() {
    const data = await this.settingsService.getAllSettings();
    return successResponse('Settings fetched', data);
  }

  @Get(':section')
  async getSection(@Param('section') section: string) {
    const key = this.assertSection(section);
    const data = await this.settingsService.getSection(key);
    return successResponse('Settings section fetched', data);
  }

  @Put(':section')
  async updateSection(
    @Param('section') section: string,
    @Body() dto: UpdateSettingsSectionDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const key = this.assertSection(section);
    const admin = this.getAdmin(user);
    if (['qpay', 'roles'].includes(key) && admin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Super admin required for this section',
        errorCode: 'FORBIDDEN',
      });
    }
    const data = await this.settingsService.updateSection(
      key,
      dto.value,
      admin.id,
      this.getIp(req),
    );
    return successResponse('Settings section updated', data);
  }
}
