import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/response.helper';
import { GoldPriceService } from './gold-price.service';

type PriceFilter = '1d' | '7d' | '1m' | '6m' | '1y';

@Controller('gold-price')
@ApiTags('Gold Price')
export class GoldPriceController {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  @Get('current')
  async getCurrentPrice() {
    const current = await this.goldPriceService.getCurrentPrice();
    return successResponse('Current gold price fetched', current);
  }

  @Get('history')
  async getPriceHistory(@Query('filter') filter?: PriceFilter) {
    const safeFilter: PriceFilter = filter ?? '7d';
    const prices = await this.goldPriceService.getPriceHistory(safeFilter);
    return successResponse('Gold price history fetched', {
      prices,
      filter: safeFilter,
    });
  }
}
