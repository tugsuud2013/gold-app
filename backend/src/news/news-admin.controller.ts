import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, NewsStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { successResponse } from '../common/response.helper';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

@Controller('admin/news')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('News')
@ApiBearerAuth()
export class NewsAdminController {
  constructor(
    private readonly newsService: NewsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get()
  async list(
    @Query('title') title?: string,
    @Query('status') status?: NewsStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('author') author?: string,
  ) {
    const data = await this.newsService.getAdminNews({ title, status, dateFrom, dateTo, author });
    return successResponse('News list fetched', data);
  }

  @Get('stats')
  async stats() {
    const data = await this.newsService.getAdminStats();
    return successResponse('News stats fetched', data);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.newsService.getAdminNewsById(id);
    return successResponse('News fetched', data);
  }

  @Post()
  async create(
    @Body() dto: CreateNewsDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.newsService.createNews(dto, user?.id);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'CREATE_NEWS',
      entity: 'News',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: { title: data.title, status: data.status },
    });
    return successResponse('News created', data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.newsService.updateNews(id, dto);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'UPDATE_NEWS',
      entity: 'News',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: { title: data.title, status: data.status },
    });
    return successResponse('News updated', data);
  }

  @Put(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.newsService.publishNews(id);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'PUBLISH_NEWS',
      entity: 'News',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: { title: data.title },
    });
    return successResponse('News published', data);
  }

  @Put(':id/archive')
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.newsService.archiveNews(id);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'ARCHIVE_NEWS',
      entity: 'News',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: { title: data.title },
    });
    return successResponse('News archived', data);
  }

  @Put(':id/draft')
  async draft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.newsService.draftNews(id);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'DRAFT_NEWS',
      entity: 'News',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: { title: data.title },
    });
    return successResponse('News saved as draft', data);
  }

  @Delete(':id/permanent')
  async deletePermanent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const existing = await this.newsService.getAdminNewsById(id);
    await this.newsService.deleteNewsPermanently(id);
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'DELETE_NEWS',
      entity: 'News',
      entityId: id,
      ipAddress: req.ip,
      metadata: { title: existing.title },
    });
    return successResponse('News deleted permanently', { id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.newsService.deleteNews(id);
    return successResponse('News deleted', data);
  }
}
