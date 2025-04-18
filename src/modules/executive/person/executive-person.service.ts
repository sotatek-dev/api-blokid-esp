import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateExecutivePersonBodyDto,
  GetExecutivePersonDepartmentQueryDto,
  GetExecutivePersonDetailResponseDto,
  GetExecutivePersonListQueryDto,
  GetExecutivePersonPositionQueryDto,
  UpdateExecutivePersonBodyDto,
} from './dtos';

@Injectable()
export class ExecutivePersonService {
  constructor(private databaseService: DatabaseService) {}

  async createExecutivePerson(body: CreateExecutivePersonBodyDto) {
    return this.databaseService.executivePerson.create({
      data: { ...body, fullName: `${body.firstName} ${body.lastName}` },
    });
  }

  async getExecutivePersonList(query: GetExecutivePersonListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.ExecutivePersonWhereInput = {
      ...(query.name && { fullName: { contains: query.name } }),
      ...(query.department && { department: { contains: query.department } }),
      ...(query.enrichmentStatus && { enrichmentStatus: { in: query.enrichmentStatus } }),
      ...(query.executiveCompanyId && { executiveCompanyId: query.executiveCompanyId }),
      ...(query.position && { position: { contains: query.position } }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }
    if (query.intentScoreRangeStart || query.intentScoreRangeEnd) {
      where.intentScore = {
        gte: query.intentScoreRangeStart,
        lte: query.intentScoreRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.executivePerson.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.executivePerson.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getExecutivePersonDetail(
    id: number,
  ): Promise<GetExecutivePersonDetailResponseDto> {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    const enrichment = await this.databaseService.personEnrichment.findFirst({
      where: { executivePersonId: id },
      select: {
        position: true,
        linkedin: true,
        companyName: true,
        companyAddress: true,
        gender: true,
      },
    });

    return { ...executivePerson, ...enrichment };
  }

  async updateExecutivePerson(id: number, body: UpdateExecutivePersonBodyDto) {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executivePerson.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteExecutivePerson(id: number) {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executivePerson.delete({ where: { id } });
  }

  async getExecutivePersonDepartment(query: GetExecutivePersonDepartmentQueryDto) {
    const departments = await this.databaseService.personEnrichment.findMany({
      where: {
        ...(query.search && { department: { contains: query.search } }),
      },
      select: {
        department: true,
      },
      distinct: ['department'],
    });
    return {
      departments: departments.map((department) => department.department),
    };
  }

  async getExecutivePersonPosition(query: GetExecutivePersonPositionQueryDto) {
    const positions = await this.databaseService.personEnrichment.findMany({
      where: {
        ...(query.search && { position: { contains: query.search } }),
      },
      select: {
        position: true,
      },
      distinct: ['position'],
    });
    return {
      positions: positions.map((position) => position.position),
    };
  }
}
