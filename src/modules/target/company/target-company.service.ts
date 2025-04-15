import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateTargetCompanyBodyDto,
  GetTargetCompanyListQueryDto,
  UpdateTargetCompanyBodyDto,
} from './dtos';

@Injectable()
export class TargetCompanyService {
  constructor(private databaseService: DatabaseService) {}

  async createTargetCompany(body: CreateTargetCompanyBodyDto) {
    return this.databaseService.targetCompany.create({
      data: { ...body },
    });
  }

  async getTargetCompanyList(query: GetTargetCompanyListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.TargetCompanyWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.userId && { userId: query.userId }),
      ...(query.name && { name: query.name }),
      ...(query.geography && { geography: query.geography }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.targetCompany.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.targetCompany.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getTargetCompanyDetail(id: number) {
    const targetCompany = await this.databaseService.targetCompany.findFirst({
      where: { id },
    });
    if (!targetCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return targetCompany;
  }

  async updateTargetCompany(id: number, body: UpdateTargetCompanyBodyDto) {
    const targetCompany = await this.databaseService.targetCompany.findFirst({
      where: { id },
    });
    if (!targetCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.targetCompany.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteTargetCompany(id: number) {
    const targetCompany = await this.databaseService.targetCompany.findFirst({
      where: { id },
    });
    if (!targetCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.targetCompany.delete({ where: { id } });
  }
}
