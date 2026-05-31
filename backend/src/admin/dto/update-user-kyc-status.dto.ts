import { KycStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserKycStatusDto {
  @IsEnum(KycStatus)
  status!: KycStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
