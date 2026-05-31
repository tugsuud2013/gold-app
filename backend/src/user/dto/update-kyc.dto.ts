import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateKycDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  lastName!: string;

  // Mongolian register format example: АБ12345678
  @ApiProperty({ example: 'АБ12345678' })
  @Matches(/^[A-ZА-ЯӨҮ]{2}[0-9]{8}$/, {
    message: 'registerNumber must match format: 2 letters + 8 digits',
  })
  registerNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'signatureImageBase64 is required' })
  @Matches(/^(data:image\/[a-zA-Z+]+;base64,)?[A-Za-z0-9+/=]+$/, {
    message: 'signatureImageBase64 must be a valid base64 image string',
  })
  signatureImageBase64!: string;
}
