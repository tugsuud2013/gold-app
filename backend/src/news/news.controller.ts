import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/response.helper';
import { NewsService } from './news.service';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getPublishedNews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.newsService.getPublishedNews(
      Number(page ?? 1),
      Number(limit ?? 10),
    );
    return successResponse('Published news fetched', data);
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const data = await this.newsService.getNewsById(id);
    return successResponse('News fetched', data);
  }
}
