import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellRequestDto {
  @ApiProperty({ example: 1.5, minimum: 0.5 })
  @IsNumber()
  @Min(0.5)
  amountGrams!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
