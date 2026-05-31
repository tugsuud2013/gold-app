import { IsObject } from 'class-validator';

export class UpdateSettingsSectionDto {
  @IsObject()
  value!: Record<string, unknown>;
}
