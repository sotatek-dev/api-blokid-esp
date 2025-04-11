import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserStatus } from '@prisma/client';
import { ServerConfig } from 'server-config/index';
import { ERROR_RESPONSE } from 'src/common/const';
import { getCurrentDate } from 'src/common/helpers/time';
import { AsyncStorage } from 'src/core/async-storage';
import { bcrypt } from 'src/core/libs/bcrypt';
import { ServerException } from 'src/exceptions';
import { DatabaseService, USER_DEFAULT_SELECT } from 'src/modules/base/database';
import { JwtTokenType } from './auth.enum';
import { JwtPayload, UserJwtPayload } from './auth.interface';
import { ChangePasswordBodyDto, ForgetPasswordBodyDto, LoginBodyDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  public async login(body: LoginBodyDto) {
    const { email } = body;
    const user = await this.findUserOrThrow({ email });
    if (user.status !== UserStatus.Active) {
      throw new ServerException({
        ...ERROR_RESPONSE.FORBIDDEN_RESOURCE,
        message: `User is not working because current status is ${user.status}`,
      });
    }
    const isCorrectPass = await bcrypt.compare(body.password, user.password);
    if (!isCorrectPass) {
      throw new ServerException(ERROR_RESPONSE.INVALID_CREDENTIALS);
    }

    return this.createTokens({ userId: user.id, role: user.role });
  }

  public async refreshToken(user: UserJwtPayload) {
    return this.createTokens({ ...user });
  }

  async findUserOrThrow(where: Prisma.UserWhereInput) {
    const user = await this.databaseService.user.findFirst({ where });
    if (!user) throw new ServerException(ERROR_RESPONSE.USER_NOT_FOUND);
    return user;
  }

  forgetPassword(body: ForgetPasswordBodyDto) {
    // todo: wait for email module
    return undefined;
  }

  async changePassword(body: ChangePasswordBodyDto) {
    const { email } = body;
    const id = AsyncStorage.get('userId') as number;
    const user = await this.findUserOrThrow({ id, email });

    const isCorrectPass = await bcrypt.compare(body.password, user.password);
    if (!isCorrectPass) {
      throw new ServerException(ERROR_RESPONSE.INVALID_CREDENTIALS);
    }

    const newPassword = await bcrypt.hash(
      body.password,
      ServerConfig.get().BCRYPT_SALT_ROUNDS,
    );

    return this.databaseService.user.update({
      where: { email },
      data: {
        password: newPassword,
      },
      select: USER_DEFAULT_SELECT,
    });
  }

  // ****************************** private methods ******************************
  private async createTokens(payload: Partial<JwtPayload>) {
    const promises: Promise<string>[] = [
      this.jwtService.signAsync(
        { ...payload, type: JwtTokenType.ACCESS_TOKEN } as JwtPayload,
        { expiresIn: ServerConfig.get().JWT_ACCESS_EXPIRED },
      ),
      this.jwtService.signAsync(
        { ...payload, type: JwtTokenType.REFRESH_TOKEN } as JwtPayload,
        { expiresIn: ServerConfig.get().JWT_REFRESH_EXPIRED },
      ),
    ];
    const [accessToken, refreshToken] = await Promise.all(promises);
    return { accessToken, refreshToken };
  }

  private async setUserLastActive(where: Prisma.UserWhereUniqueInput) {
    await this.findUserOrThrow(where);
    return this.databaseService.user.update({
      where: { ...where },
      data: { lastActive: getCurrentDate() },
    });
  }

  private async validateUser(payload: JwtPayload) {
    return this.databaseService.user.findFirst({ where: { id: payload.userId } });
  }
}
