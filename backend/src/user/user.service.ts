import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      registerNumber: user.registerNumber,
      kycStatus: user.kycStatus,
      membershipLevel: user.membershipLevel,
      status: user.status,
      signatureImageUrl: user.signatureImageUrl,
      wallet: user.wallet
        ? {
            balanceGrams: user.wallet.balanceGrams,
            totalPurchasedGrams: user.wallet.totalPurchasedGrams,
            totalSoldGrams: user.wallet.totalSoldGrams,
          }
        : null,
    };
  }

  async submitKyc(userId: string, dto: UpdateKycDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    if (user.kycStatus === KycStatus.VERIFIED) {
      throw new BadRequestException({
        message: 'KYC already verified',
        errorCode: 'KYC_ALREADY_VERIFIED',
      });
    }

    const registerPattern = /^[A-ZА-ЯӨҮ]{2}[0-9]{8}$/;
    if (!registerPattern.test(dto.registerNumber)) {
      throw new BadRequestException({
        message: 'registerNumber must match format: 2 letters + 8 digits',
        errorCode: 'INVALID_REGISTER_NUMBER',
      });
    }

    const base64 = dto.signatureImageBase64.includes(',')
      ? dto.signatureImageBase64.split(',')[1]
      : dto.signatureImageBase64;

    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(base64, 'base64');
    } catch {
      throw new BadRequestException({
        message: 'Invalid base64 image data',
        errorCode: 'INVALID_SIGNATURE_IMAGE',
      });
    }

    if (!imageBuffer.length) {
      throw new BadRequestException({
        message: 'Signature image cannot be empty',
        errorCode: 'EMPTY_SIGNATURE_IMAGE',
      });
    }

    const relativePath = `uploads/signatures/${userId}.png`;
    const absolutePath = join(process.cwd(), relativePath);
    await writeFile(absolutePath, imageBuffer);

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          registerNumber: dto.registerNumber,
          signatureImageUrl: `/${relativePath.replace(/\\/g, '/')}`,
          kycStatus: KycStatus.PENDING,
        },
      });
    } catch {
      throw new ConflictException({
        message: 'registerNumber already exists',
        errorCode: 'REGISTER_NUMBER_EXISTS',
      });
    }
  }

  async getKycStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    return { kycStatus: user.kycStatus };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException({
        message: 'Current password is incorrect',
        errorCode: 'INVALID_CURRENT_PASSWORD',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { changed: true };
  }

  async updatePushToken(userId: string, pushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: pushToken },
    });
    return { updated: true };
  }
}
