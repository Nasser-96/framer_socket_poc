import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import ReturnResponse from 'src/helper/returnResponse';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

interface SignupParams {
  password: string;
  username: string;
}

interface LoginParams {
  password: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup({ username, password }: SignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (userExists) {
      throw new ConflictException(
        ReturnResponse({
          response: [{ field: 'username', error: 'Username Already Exists' }],
          is_successful: false,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService?.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });

    const token = await this.generateJWT(user?.username, user.id);

    return ReturnResponse({
      response: { user_token: token },
      success: 'User Created Successfully',
    });
  }

  private async generateJWT(username: string, id?: number) {
    return this.jwtService.signAsync(
      {
        username: username,
        id: id,
      },
      { secret: process.env.JSON_TOKEN_KEY },
    );
  }

  async login({ username, password }: LoginParams) {
    const getUserByEmail = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (!getUserByEmail) {
      throw new BadGatewayException(
        ReturnResponse({
          error_msg: 'Username or Password incorrect',
          is_successful: false,
        }),
      );
    }
    const isValidPassword = await bcrypt?.compare(
      password,
      getUserByEmail?.password,
    );

    if (getUserByEmail && isValidPassword) {
      const token = await this.generateJWT(
        getUserByEmail?.username,
        getUserByEmail?.id,
      );
      return ReturnResponse({
        response: { user_token: token, username },
        is_successful: true,
      });
    } else {
      throw new BadGatewayException(
        ReturnResponse({ error_msg: 'Username or Password incorrect' }),
      );
    }
  }

  async updateUserName(token: string, newName: string) {
    const decodedData = this.jwtService.verify(token, {
      secret: process.env.JSON_TOKEN_KEY,
    });
    await this.prismaService.user.update({
      where: { id: decodedData.id },
      data: { username: newName },
    });
  }
}
