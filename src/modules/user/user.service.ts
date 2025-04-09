import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { generateRandomString } from 'src/common/helpers/string';
import { ServerConfig } from 'src/core/config';
import { bcrypt } from 'src/core/libs/bcrypt';
import { ServerException } from 'src/exceptions';
import { DatabaseService, USER_DEFAULT_SELECT } from 'src/modules/base/database';
import { CreateUserBodyDto, GetUserListQueryDto, UpdateUserBodyDto } from './dtos';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async createUser(body: CreateUserBodyDto) {
    const user = await this.databaseService.user.findFirst({
      where: { email: body.email },
    });
    if (user) {
      throw new ServerException(ERROR_RESPONSE.USER_ALREADY_EXISTED);
    }

    const { BCRYPT_SALT_ROUNDS } = ServerConfig.get();
    const randomPassword = generateRandomString(8);
    const password = await bcrypt.hash(randomPassword, BCRYPT_SALT_ROUNDS);

    return this.databaseService.user.create({
      data: { ...body, password, forceResetPassword: true },
    });
  }

  async getUserList(query: GetUserListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.UserWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.email && { email: query.email }),
      ...(query.fullName && { fullName: query.fullName }),
      ...(query.phoneNumber && { phoneNumber: query.phoneNumber }),
      ...(query.status && { status: query.status }),
      ...(query.role && { role: query.role }),
      ...(query.gender && { gender: query.gender }),
      ...(query.address && { address: query.address }),
      ...(query.imageLink && { imageLink: query.imageLink }),
      ...(query.language && { language: query.language }),
    };
    if (query.dobRangeStart || query.dobRangeEnd) {
      where.dob = {
        gte: query.dobRangeStart,
        lte: query.dobRangeEnd,
      };
    }
    if (query.lastActiveRangeStart || query.lastActiveRangeEnd) {
      where.lastActive = {
        gte: query.lastActiveRangeStart,
        lte: query.lastActiveRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.user.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
        select: USER_DEFAULT_SELECT,
      }),
      this.databaseService.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getUserDetail(id: number) {
    const user = await this.databaseService.user.findFirst({
      where: { id },
      select: USER_DEFAULT_SELECT,
    });
    if (!user) {
      throw new ServerException(ERROR_RESPONSE.USER_NOT_FOUND);
    }
    return user;
  }

  async updateUser(id: number, body: UpdateUserBodyDto) {
    const user = await this.databaseService.user.findFirst({
      where: { id },
      select: USER_DEFAULT_SELECT,
    });
    if (!user) {
      throw new ServerException(ERROR_RESPONSE.USER_NOT_FOUND);
    }
    return this.databaseService.user.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteUser(id: number) {
    const user = await this.databaseService.user.findFirst({ where: { id } });
    if (!user) {
      throw new ServerException(ERROR_RESPONSE.USER_NOT_FOUND);
    }
    return this.databaseService.user.delete({ where: { id } });
  }
}
