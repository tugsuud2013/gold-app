import { IsOptional, IsString } from 'class-validator';

export class CancelSellRequestDto {
  @IsOptional()
  @IsString()
  note?: string;
}
