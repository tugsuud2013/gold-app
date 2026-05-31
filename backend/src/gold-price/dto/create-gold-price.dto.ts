import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGoldPriceDto {
  @IsNumber()
  @Min(1)
  mongolBankPrice!: number;

  @IsNumber()
  @Min(1)
  buyPrice!: number;

  @IsNumber()
  @Min(1)
  sellPrice!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
