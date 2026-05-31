import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

const adminInclude = {
  admin: { select: { id: true, name: true, email: true } },
} as const;

type AdminNewsFilters = {
  title?: string;
  status?: NewsStatus;
  dateFrom?: string;
  dateTo?: string;
  author?: string;
};

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 180);
  }

  private resolveStatus(dto: { status?: NewsStatus; isPublished?: boolean }, existing?: NewsStatus) {
    if (dto.status) return dto.status;
    if (dto.isPublished === true) return NewsStatus.PUBLISHED;
    if (dto.isPublished === false && existing === NewsStatus.PUBLISHED) return NewsStatus.DRAFT;
    return existing ?? NewsStatus.DRAFT;
  }

  private publishFields(status: NewsStatus, publishedAt?: Date | null) {
    const isPublished = status === NewsStatus.PUBLISHED;
    return {
      status,
      isPublished,
      publishedAt: isPublished ? publishedAt ?? new Date() : publishedAt ?? null,
    };
  }

  private buildImageUrls(coverImage?: string, galleryImages?: string[], fallback: string[] = []) {
    const urls = [coverImage, ...(galleryImages ?? [])].filter(Boolean) as string[];
    return urls.length ? urls : fallback;
  }

  private serializeNews<T extends { coverImageUrl?: string | null; imageUrls: string[] }>(item: T) {
    const coverImageUrl = item.coverImageUrl ?? item.imageUrls?.[0] ?? null;
    return { ...item, coverImageUrl };
  }

  private serializeNewsList<T extends { coverImageUrl?: string | null; imageUrls: string[] }>(
    items: T[],
  ) {
    return items.map((item) => this.serializeNews(item));
  }

  async getPublishedNews(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.NewsWhereInput = {
      OR: [{ status: NewsStatus.PUBLISHED }, { isPublished: true }],
    };

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.news.count({ where }),
    ]);

    return { page: safePage, limit: safeLimit, total, items };
  }

  async getNewsById(id: string) {
    const item = await this.prisma.news.findUnique({ where: { id } });
    if (!item || (!item.isPublished && item.status !== NewsStatus.PUBLISHED)) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }
    return item;
  }

  async getAdminNews(filters: AdminNewsFilters = {}) {
    const where: Prisma.NewsWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.title?.trim()) {
      where.title = { contains: filters.title.trim(), mode: 'insensitive' };
    }
    if (filters.author?.trim()) {
      where.admin = {
        OR: [
          { name: { contains: filters.author.trim(), mode: 'insensitive' } },
          { email: { contains: filters.author.trim(), mode: 'insensitive' } },
        ],
      };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(`${filters.dateFrom}T00:00:00`);
      if (filters.dateTo) where.createdAt.lte = new Date(`${filters.dateTo}T23:59:59`);
    }

    return this.serializeNewsList(
      await this.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: adminInclude,
      }),
    );
  }

  async getAdminStats() {
    const [total, published, draft, archived] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.news.count({ where: { status: NewsStatus.PUBLISHED } }),
      this.prisma.news.count({ where: { status: NewsStatus.DRAFT } }),
      this.prisma.news.count({ where: { status: NewsStatus.ARCHIVED } }),
    ]);
    return { total, published, draft, archived };
  }

  async getAdminNewsById(id: string) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: adminInclude,
    });
    if (!item) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }
    return this.serializeNews(item);
  }

  private newsWriteData(dto: CreateNewsDto | UpdateNewsDto, imageUrls?: string[]) {
    const urls = imageUrls ?? dto.imageUrls ?? [];
    const coverImageUrl =
      ('coverImageUrl' in dto && dto.coverImageUrl?.trim()) || urls[0] || null;
    return {
      coverImageUrl,
      imageUrls: coverImageUrl
        ? [coverImageUrl, ...urls.filter((url) => url !== coverImageUrl)]
        : urls,
    };
  }

  async createNews(dto: CreateNewsDto, adminId?: string) {
    const status = this.resolveStatus(dto);
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
    const publishData = this.publishFields(status, publishedAt);
    const slug = dto.slug?.trim() || this.slugify(dto.title);
    const images = this.newsWriteData(dto);

    return this.serializeNews(
      await this.prisma.news.create({
        data: {
          title: dto.title,
          summary: dto.summary?.trim() || null,
          content: dto.content,
          ...images,
          tags: dto.tags ?? [],
          slug,
          metaTitle: dto.metaTitle?.trim() || null,
          metaDescription: dto.metaDescription?.trim() || null,
          adminId: adminId ?? null,
          ...publishData,
        },
        include: adminInclude,
      }),
    );
  }

  async updateNews(id: string, dto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }

    const status = this.resolveStatus(dto, existing.status);
    const publishedAt =
      dto.publishedAt != null
        ? new Date(dto.publishedAt)
        : status === NewsStatus.PUBLISHED
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt;
    const publishData = this.publishFields(status, publishedAt);
    const images = dto.imageUrls || dto.coverImageUrl ? this.newsWriteData(dto, dto.imageUrls) : {};

    return this.serializeNews(
      await this.prisma.news.update({
        where: { id },
        data: {
          title: dto.title,
          summary: dto.summary !== undefined ? dto.summary?.trim() || null : undefined,
          content: dto.content,
          ...images,
          tags: dto.tags,
          slug: dto.slug?.trim() || (dto.title ? this.slugify(dto.title) : undefined),
          metaTitle: dto.metaTitle !== undefined ? dto.metaTitle?.trim() || null : undefined,
          metaDescription:
            dto.metaDescription !== undefined ? dto.metaDescription?.trim() || null : undefined,
          ...publishData,
        },
        include: adminInclude,
      }),
    );
  }

  async deleteNews(id: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }

    return this.prisma.news.update({
      where: { id },
      data: {
        isPublished: false,
        status: NewsStatus.DRAFT,
      },
    });
  }

  async deleteNewsPermanently(id: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }
    return this.prisma.news.delete({ where: { id } });
  }

  async publishNews(id: string) {
    return this.setStatus(id, NewsStatus.PUBLISHED);
  }

  async archiveNews(id: string) {
    return this.setStatus(id, NewsStatus.ARCHIVED);
  }

  async draftNews(id: string) {
    return this.setStatus(id, NewsStatus.DRAFT);
  }

  private async setStatus(id: string, status: NewsStatus) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'News not found',
        errorCode: 'NEWS_NOT_FOUND',
      });
    }
    const publishData = this.publishFields(
      status,
      status === NewsStatus.PUBLISHED ? existing.publishedAt ?? new Date() : existing.publishedAt,
    );
    if (status !== NewsStatus.PUBLISHED) {
      publishData.publishedAt = existing.publishedAt;
      publishData.isPublished = false;
    }
    return this.serializeNews(
      await this.prisma.news.update({
        where: { id },
        data: publishData,
        include: adminInclude,
      }),
    );
  }
}
