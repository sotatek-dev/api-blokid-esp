import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
        include: {
          CampaignMetric: true,
          ExecutiveCompany: true,
        },
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
      ...(query.id && { id: query.id }),
      ...(query.campaignName && { campaignName: query.campaignName }),
      ...(query.budget && { budget: query.budget }),
      ...(query.spend && { spend: query.spend }),
      ...(query.remaining && { remaining: query.remaining }),
      ...(query.reached && { reached: query.reached }),
      ...(query.status && { status: query.status }),
      ...(query.objective && { objective: query.objective }),
      ...(query.description && { description: query.description }),
      ...(query.geography && { geography: query.geography }),
      ...(query.role && { role: query.role }),
      ...(query.executiveCompanyId && { executiveCompanyId: query.executiveCompanyId }),
      ...(query.campaignMetricId && { campaignMetricId: query.campaignMetricId }),
      ...(query.isBugdetByChannel && { isBugdetByChannel: query.isBugdetByChannel }),
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
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.campaign.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
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
