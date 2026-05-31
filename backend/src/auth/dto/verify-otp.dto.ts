import { Matches } from 'class-validator';

export class VerifyOtpDto {
  @Matches(/^[0-9]{8}$/, {
    message: 'phoneNumber must be 8 digits',
  })
  phoneNumber!: string;

  @Matches(/^[0-9]{6}$/, { message: 'otp must be 6 digits' })
  otp!: string;
}
