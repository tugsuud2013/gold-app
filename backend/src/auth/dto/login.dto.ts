import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @Matches(/^[0-9]{8}$/, {
    message: 'phoneNumber must be 8 digits (Mongolian format)',
  })
  phoneNumber!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
