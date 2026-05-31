import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePurchaseDto {
  @ApiProperty({ example: 2.5, minimum: 0.5, maximum: 10 })
  @IsNumber()
  @Min(0.5)
  @Max(10)
  amountGrams!: number;
}
