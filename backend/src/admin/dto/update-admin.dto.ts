import { AdminRole, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
