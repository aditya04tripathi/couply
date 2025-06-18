import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signin(dto: SignInDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException(
        `The user with ${dto.email} was not found. Please sign up.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatches = await argon.verify(user.hashedPassword!, password);
    if (!passwordMatches) {
      throw new HttpException(
        'The password entered seems to be invalid. Please try again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = await this.signToken(user.id, user.email);

    return token;
  }

  async signup(dto: SignUpDto) {
    const hashedPassword = await argon.hash(dto.password);

    await this.prisma.user.create({
      data: {
        email: dto.email,
        hashedPassword: hashedPassword,
        name: dto.name,
      },
    });

    return {
      message:
        'A new user has been created successfully. Enjoy your time on TemplateAPI!',
    };
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    return {
      access_token: await this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET')!,
        expiresIn: '1h',
      }),
    };
  }

  async getMe(user: User) {
    const userId = user.id;

    const userData = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        hashedPassword: false,
      },
    });

    if (!userData) {
      throw new HttpException(
        'The user was not found. Please sign up.',
        HttpStatus.NOT_FOUND,
      );
    }

    return userData;
  }
}
