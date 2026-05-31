import { IsBoolean } from 'class-validator';

export class UpdateUserChatBanDto {
  @IsBoolean()
  isChatBanned!: boolean;
}
