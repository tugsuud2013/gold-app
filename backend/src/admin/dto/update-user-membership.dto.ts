import { MembershipLevel } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserMembershipDto {
  @IsEnum(MembershipLevel)
  membershipLevel!: MembershipLevel;
}
