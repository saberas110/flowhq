import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserService } from '../user/user.service';
import { RegisterDto } from './auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (
      user &&
      user.isActive &&
      (await bcrypt.compare(password, user.password))
    ) {
      return user;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get default role (e.g., 'user')
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new BadRequestException('Default role not found');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: [defaultRole],
    });

    const savedUser = await this.userRepository.save(user);

    // Load user with relations
    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });

    const tokens = await this.generateTokens(userWithRoles!);

    return {
      ...tokens,
      user: {
        id: userWithRoles!.id,
        email: userWithRoles!.email,
        firstName: userWithRoles!.firstName,
        lastName: userWithRoles!.lastName,
        roles: userWithRoles!.roles.map((role) => role.name),
      },
    };
  }

  async login(user: User): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role: Role) => role.name),
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the old refresh token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new tokens
    const tokens = await this.generateTokens(storedToken.user);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    // Logout from all devices
    await this.logoutAll(userId);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    // Create refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: await this.generateRefreshToken(),
      expiresAt: new Date(
        Date.now() +
          this.parseExpiresIn(
            this.configService.getOrThrow<string>('jwt.refreshExpiresIn')
          )
      ),
    });

    const savedRefreshToken = await this.refreshTokenRepository.save(
      refreshTokenEntity
    );

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      tokenId: savedRefreshToken.id,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Update the stored token with the signed JWT
    savedRefreshToken.token = refreshToken;
    await this.refreshTokenRepository.save(savedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateRefreshToken(): Promise<string> {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000; // Default to seconds
    }
  }
}
