import { Matches } from 'class-validator';

export class SendOtpDto {
  @Matches(/^[0-9]{8}$/, {
    message: 'phoneNumber must be 8 digits (Mongolian format)',
  })
  phoneNumber!: string;
}
