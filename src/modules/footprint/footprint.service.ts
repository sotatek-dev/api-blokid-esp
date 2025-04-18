import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateFootprintBodyDto,
  GetFootprintListQueryDto,
  UpdateFootprintBodyDto,
} from './dtos';

@Injectable()
export class FootprintService {
  constructor(private databaseService: DatabaseService) {}

  async createFootprint(body: CreateFootprintBodyDto) {
    return this.databaseService.footprint.create({
      data: { ...body },
    });
  }

  async getFootprintList(query: GetFootprintListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.FootprintWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.action && { action: query.action }),
      ...(query.element && { element: query.element }),
      ...(query.actionDetail && { actionDetail: query.actionDetail }),
      ...(query.deviceUsed && { deviceUsed: query.deviceUsed }),
      ...(query.priorityLevel && { priorityLevel: query.priorityLevel }),
      ...(query.intentScore && { intentScore: query.intentScore }),
      ...(query.confidence && { confidence: query.confidence }),
      ...(query.personId && { personId: query.personId }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.footprint.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.footprint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getFootprintDetail(id: number) {
    const footprint = await this.databaseService.footprint.findFirst({ where: { id } });
    if (!footprint) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return footprint;
  }

  async updateFootprint(id: number, body: UpdateFootprintBodyDto) {
    const footprint = await this.databaseService.footprint.findFirst({ where: { id } });
    if (!footprint) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.footprint.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteFootprint(id: number) {
    const footprint = await this.databaseService.footprint.findFirst({ where: { id } });
    if (!footprint) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.footprint.delete({ where: { id } });
  }
}
