import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
@ApiTags('Admin')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health() {
    let database: 'connected' | 'disconnected' = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'disconnected';
    }

    return {
      status: 'ok',
      database,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
