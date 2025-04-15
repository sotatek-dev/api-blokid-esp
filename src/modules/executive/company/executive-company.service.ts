import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateExecutiveCompanyBodyDto,
  GetExecutiveCompanyListQueryDto,
  UpdateExecutiveCompanyBodyDto,
} from './dtos';

@Injectable()
export class ExecutiveCompanyService {
  constructor(private databaseService: DatabaseService) {}

  async createExecutiveCompany(body: CreateExecutiveCompanyBodyDto) {
    return this.databaseService.executiveCompany.create({
      data: { ...body },
    });
  }

  async getExecutiveCompanyList(query: GetExecutiveCompanyListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.ExecutiveCompanyWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.businessId && { businessId: query.businessId }),
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
      this.databaseService.executiveCompany.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.executiveCompany.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getExecutiveCompanyDetail(id: number) {
    const executiveCompany = await this.databaseService.executiveCompany.findFirst({
      where: { id },
    });
    if (!executiveCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return executiveCompany;
  }

  async updateExecutiveCompany(id: number, body: UpdateExecutiveCompanyBodyDto) {
    const executiveCompany = await this.databaseService.executiveCompany.findFirst({
      where: { id },
    });
    if (!executiveCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executiveCompany.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteExecutiveCompany(id: number) {
    const executiveCompany = await this.databaseService.executiveCompany.findFirst({
      where: { id },
    });
    if (!executiveCompany) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executiveCompany.delete({ where: { id } });
  }
}
