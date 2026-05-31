import { MembershipLevel } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MembershipConfigItemDto {
  @IsEnum(MembershipLevel)
  level!: MembershipLevel;

  @IsNumber()
  minGrams!: number;
}

export class UpdateMembershipConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MembershipConfigItemDto)
  configs!: MembershipConfigItemDto[];
}
