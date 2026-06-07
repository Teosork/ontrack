import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import ms from 'ms';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  async issueForUser(userId: string): Promise<string> {
    const token = this.generateToken();
    const hashedToken = this.hash(token);
    const expiresIn = this.config.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    ) as StringValue;
    const expiresAt = new Date(Date.now() + ms(expiresIn));

    await this.prisma.refreshToken.create({
      data: { hashedToken, userId, expiresAt },
    });

    return token;
  }

  async validateAndRotate(plainToken: string) {
    const hashedToken = this.hash(plainToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const newToken = await this.issueForUser(record.userId);
    return { userId: record.userId, newToken };
  }

  async revoke(plainToken: string) {
    const hashedToken = this.hash(plainToken);
    await this.prisma.refreshToken.updateMany({
      where: { hashedToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
