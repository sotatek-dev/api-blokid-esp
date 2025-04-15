import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateTargetPersonBodyDto,
  EnrichPeopleBodyDto,
  GetTargetPersonListQueryDto,
  UpdateTargetPersonBodyDto,
  UploadTargetPersonListBodyDto,
} from './dtos';

@Injectable()
export class TargetPersonService {
  constructor(private databaseService: DatabaseService) {}

  async createTargetPerson(body: CreateTargetPersonBodyDto) {
    return this.databaseService.targetPerson.create({
      data: { ...body, fullName: `${body.firstName} ${body.lastName}` },
    });
  }

  async getTargetPersonList(query: GetTargetPersonListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.TargetPersonWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.name && { fullName: { contains: query.name } }),
      ...(query.companyName && { companyName: query.companyName }),
      ...(query.department && { department: query.department }),
      ...(query.enrichmentStatus && { enrichmentStatus: { in: query.enrichmentStatus } }),
      ...(query.targetCompanyId && { targetCompanyId: query.targetCompanyId }),
      Enrichment: {
        some: {},
      },
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
    if (query.position) {
      where.Enrichment = {
        some: { position: { contains: query.position } },
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.targetPerson.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.targetPerson.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getTargetPersonDetail(id: number) {
    const targetPerson = await this.databaseService.targetPerson.findFirst({
      where: { id },
    });
    if (!targetPerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return targetPerson;
  }

  async updateTargetPerson(id: number, body: UpdateTargetPersonBodyDto) {
    const targetPerson = await this.databaseService.targetPerson.findFirst({
      where: { id },
    });
    if (!targetPerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.targetPerson.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteTargetPerson(id: number) {
    const targetPerson = await this.databaseService.targetPerson.findFirst({
      where: { id },
    });
    if (!targetPerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.targetPerson.delete({ where: { id } });
  }

  async uploadTargetPersonList(body: UploadTargetPersonListBodyDto) {
    return undefined;
  }

  async enrichPeople(body: EnrichPeopleBodyDto) {
    return undefined;
  }
}
