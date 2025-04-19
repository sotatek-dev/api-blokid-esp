import { Injectable } from '@nestjs/common';
import { CampaignStatus, Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import { CampaignBuilderStep } from 'src/modules/campaign/campaign.enum';
import {
  CreateCampaignBodyDto,
  CreateCampaignRequestDto,
  CreateCampaignStrategyDto,
  GetCampaignListQueryDto,
  UpdateCampaignBodyDto,
} from './dtos';

@Injectable()
export class CampaignService {
  constructor(private databaseService: DatabaseService) {}

  async createCampaign(body: CreateCampaignRequestDto) {
    const { step, campaignStrategies, ...rest } = body;

    if (step !== CampaignBuilderStep.PREVIEW) {
      return {
        message: `Campaign data validated successfully`,
      };
    }

    return this.databaseService.$transaction(async (prisma) => {
      const campaignMetric = await prisma.campaignMetric.create({
        data: {
          spend: 8000,
          account: 1,
          impressions: 100000,
          avgTimeOnSite: 20,
          performance: {
            allChannels: {
              spend: 8000,
              remaining: 2000,
            },
          },
        },
      });

      const campaignData: CreateCampaignBodyDto = {
        ...rest,
        campaignMetricId: campaignMetric.id,
      };

      const campaign = await prisma.campaign.create({
        data: campaignData,
      });

      const campaignStrategiesData: CreateCampaignStrategyDto[] = campaignStrategies.map(
        (strategy) => {
          const { step, isBudgetByChannel, ...strategyData } = strategy;
          return {
            ...strategyData,
            campaignId: campaign.id,
            campaignMetricId: campaignMetric.id,
          };
        },
      );

      await prisma.campaignStrategy.createMany({
        data: campaignStrategiesData,
        skipDuplicates: false,
      });

      return campaign;
    });
  }

  async getCampaignList(query: GetCampaignListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.CampaignWhereInput = {
      ...(query.budget && { budget: query.budget }),
      ...(query.remaining && { remaining: query.remaining }),
      ...(query.status && { status: query.status }),
    };
    if (query.startDateRangeStart || query.startDateRangeEnd) {
      where.startDate = {
        gte: query.startDateRangeStart,
        lte: query.startDateRangeEnd,
      };
    }
    if (query.endDateRangeStart || query.endDateRangeEnd) {
      where.endDate = {
        gte: query.endDateRangeStart,
        lte: query.endDateRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.campaign.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.databaseService.campaign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getCampaignDetail(id: number) {
    const campaign = await this.databaseService.campaign.findFirst({
      where: { id },
      include: {
        CampaignMetric: true,
        CampaignStrategy: true,
      },
    });
    if (!campaign) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return campaign;
  }

  async updateCampaign(id: number, body: UpdateCampaignBodyDto) {
    const campaign = await this.databaseService.campaign.findFirst({ where: { id } });
    if (!campaign) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.campaign.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteCampaign(id: number) {
    const campaign = await this.databaseService.campaign.findFirst({ where: { id } });
    if (!campaign) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    if (campaign.status === CampaignStatus.Pending) {
      throw new ServerException(ERROR_RESPONSE.BAD_REQUEST);
    }

    return this.databaseService.$transaction(async (prisma) => {
      await prisma.campaignStrategy.deleteMany({
        where: { campaignId: id },
      });

      await prisma.campaign.delete({
        where: { id },
      });

      await prisma.campaignMetric.delete({
        where: { id: campaign.campaignMetricId },
      });
    });
  }
}
