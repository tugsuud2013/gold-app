import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [ActivityLogModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
