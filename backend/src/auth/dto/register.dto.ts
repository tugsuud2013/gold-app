import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, Matches, MinLength } from 'class-validator';

/** Mongolian local mobile: exactly 8 digits */
const PHONE_REGEX = /^[0-9]{8}$/;

/** Min 8 chars, at least one letter and one number */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @ApiProperty({ example: '99112233' })
  @IsMobilePhone('mn-MN', undefined, {
    message: 'phoneNumber must be a valid Mongolian mobile number',
  })
  @Matches(PHONE_REGEX, {
    message: 'phoneNumber must be 8 digits (Mongolian format)',
  })
  phoneNumber!: string;

  @ApiProperty({ example: 'Password123' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @Matches(PASSWORD_REGEX, {
    message: 'password must contain at least one letter and one number',
  })
  password!: string;
}
