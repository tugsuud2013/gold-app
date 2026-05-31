import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class CreateNewsDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}
