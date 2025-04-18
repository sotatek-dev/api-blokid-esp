import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { PaginationResponseDto } from 'src/core/platform/dtos';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorators';
import { AuthGuard } from 'src/guards';
import { CampaignService } from './campaign.service';
import {
  CreateCampaignRequestDto,
  CreateCampaignResponseDto,
  GetCampaignDetailResponseDto,
  GetCampaignListQueryDto,
  GetCampaignListResponseDto,
  UpdateCampaignBodyDto,
  UpdateCampaignResponseDto,
} from './dtos';

@Controller('campaign')
@ApiTags('Campaign')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateCampaignResponseDto,
    },
    body: { type: CreateCampaignRequestDto, required: true },
    operation: {
      operationId: `createCampaign`,
      summary: `Api createCampaign`,
    },
  })
  async createCampaign(@Body() body: CreateCampaignRequestDto): Promise<any> {
    return this.campaignService.createCampaign(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetCampaignListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getCampaignList`,
      summary: `Api getCampaignList`,
    },
  })
  async getCampaignList(
    @Query() query: GetCampaignListQueryDto,
  ): Promise<PaginationResponseDto<GetCampaignListResponseDto>> {
    return this.campaignService.getCampaignList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetCampaignDetailResponseDto,
    },
    operation: {
      operationId: `getCampaignDetail`,
      summary: `Api getCampaignDetail`,
    },
  })
  async getCampaignDetail(
    @Param('id') id: number,
  ): Promise<GetCampaignDetailResponseDto> {
    return this.campaignService.getCampaignDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateCampaignResponseDto,
    },
    body: { type: UpdateCampaignBodyDto, required: true },
    operation: {
      operationId: `updateCampaign`,
      summary: `Api updateCampaign`,
    },
  })
  async updateCampaign(
    @Param('id') id: number,
    @Body() body: UpdateCampaignBodyDto,
  ): Promise<UpdateCampaignResponseDto> {
    return this.campaignService.updateCampaign(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteCampaign`,
      summary: `Api deleteCampaign`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampaign(@Param('id') id: number): Promise<void> {
    await this.campaignService.deleteCampaign(id);
  }
}
