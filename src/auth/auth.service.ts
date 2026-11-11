import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../database/entities/user.entity';
import { UnauthorizedDomainException } from '../common/domain/domain-exception.base';

export interface TokenPayload {
  sub: string;
  id?: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export function parseDurationToSeconds(raw: string): number {
  const trimmed = (raw || '7d').trim();
  const match = /^(\d+)\s*([dhms])?$/i.exec(trimmed);
  if (!match) {
    return 7 * 24 * 60 * 60;
  }
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
    default:
      return value;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name } = registerDto;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.createCustomerUser({
      email,
      password_hash,
      first_name,
      last_name,
      is_active: true,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedDomainException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedDomainException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedDomainException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (refreshSecret) {
      try {
        const verified = await this.jwtService.verifyAsync<{ sub: string }>(
          refreshToken,
          { secret: refreshSecret },
        );
        if (verified.sub !== userId) {
          throw new UnauthorizedDomainException(
            'Refresh token subject mismatch',
          );
        }
      } catch {
        throw new UnauthorizedDomainException(
          'Invalid or expired refresh token',
        );
      }
    }

    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedDomainException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.is_active) {
      await this.redisService.del(`refresh_token:${userId}`);
      throw new UnauthorizedDomainException('User no longer valid');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  private async generateTokens(user: User) {
    const roles =
      typeof user.getRoleNames === 'function'
        ? user.getRoleNames()
        : (user.userRoles
            ?.map((ur) => ur.role?.name)
            .filter((n): n is string => Boolean(n)) ?? []);

    const permissions =
      typeof user.getPermissionActions === 'function'
        ? user.getPermissionActions()
        : [];

    const payload: TokenPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      roles: Array.from(new Set(roles)),
      permissions: Array.from(new Set(permissions)),
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshExpStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    const refreshExpSeconds = parseDurationToSeconds(refreshExpStr);

    const refreshSignOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpSeconds,
    };

    const refreshToken = this.jwtService.sign(
      { sub: user.id, id: user.id },
      refreshSignOptions,
    );

    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      refreshExpSeconds,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
