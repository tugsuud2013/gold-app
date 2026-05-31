import { IsString, MinLength } from 'class-validator';

export class SignContractDto {
  @IsString()
  @MinLength(1)
  purchaseId!: string;
}
