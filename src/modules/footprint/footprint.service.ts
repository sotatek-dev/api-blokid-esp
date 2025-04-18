import { Injectable } from '@nestjs/common';
import { FootprintAction, FootprintElement, Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { AsyncStorage } from 'src/core/async-storage';
import { Time } from 'src/core/libs/time';
import { PaginationResponseDto } from 'src/core/platform/dtos';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import {
  CreateFootprintBodyDto,
  GetFootprintListQueryDto,
  GetFootprintListResponseDto,
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

  async getFootprintFake(
    _query: GetFootprintListQueryDto,
  ): Promise<PaginationResponseDto<GetFootprintListResponseDto>> {
    return {
      data: [
        {
          id: 1,
          action: FootprintAction.Click,
          element: FootprintElement.Ads,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Tech Solution Ads',
          deviceUsed: 'Laptop',
          intentScore: 89,
          confidence: 89,
        },
        {
          id: 2,
          action: FootprintAction.Download,
          element: FootprintElement.Image,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'image 304',
          deviceUsed: 'Tablet',
          intentScore: 90,
          confidence: 86,
        },
        {
          id: 3,
          action: FootprintAction.View,
          element: FootprintElement.Page,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Homepage',
          deviceUsed: 'Desktop',
          intentScore: 16,
          confidence: 87,
        },
        {
          id: 4,
          action: FootprintAction.SubmitForm,
          element: FootprintElement.Form,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Register Form',
          deviceUsed: 'Smartphone',
          intentScore: 20,
          confidence: 93,
        },
        {
          id: 5,
          action: FootprintAction.Click,
          element: FootprintElement.Cart,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'My Cart',
          deviceUsed: 'Smartwatch',
          intentScore: 68,
          confidence: 70,
        },
        {
          id: 6,
          action: FootprintAction.Visit,
          element: FootprintElement.Page,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Homepage',
          deviceUsed: 'Tablet',
          intentScore: 70,
          confidence: 86,
        },
        {
          id: 7,
          action: FootprintAction.Download, // Assuming typo in original source
          element: FootprintElement.Image,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'image 306',
          deviceUsed: 'TV/Smart TV',
          intentScore: 94,
          confidence: 98,
        },
        {
          id: 8,
          action: FootprintAction.Share,
          element: FootprintElement.SocialMedia,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Daily Post',
          deviceUsed: 'Smartphone',
          intentScore: 39,
          confidence: 32,
        },
        {
          id: 9,
          action: FootprintAction.Click,
          element: FootprintElement.Ads,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Tech Solution Ads',
          deviceUsed: 'Smartphone',
          intentScore: 45,
          confidence: 40,
        },
        {
          id: 10,
          action: FootprintAction.Share,
          element: FootprintElement.SocialMedia,
          createdAt: Time('2025-04-10 09:12 AM').toDate(),
          actionDetail: 'Daily Post',
          deviceUsed: 'Smartphone',
          intentScore: 10,
          confidence: 10,
        },
      ],
      pagination: { page: 1, pageSize: 10, total: 10, totalPages: 1 },
    };
  }
}
