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
import {
  CreateFootprintBodyDto,
  CreateFootprintResponseDto,
  GetFootprintDetailResponseDto,
  GetFootprintListQueryDto,
  GetFootprintListResponseDto,
  UpdateFootprintBodyDto,
  UpdateFootprintResponseDto,
} from './dtos';
import { FootprintService } from './footprint.service';

@Controller('footprint')
@ApiTags('Footprint')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class FootprintController {
  constructor(private readonly footprintService: FootprintService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateFootprintResponseDto,
    },
    body: { type: CreateFootprintBodyDto, required: true },
    operation: {
      operationId: `createFootprint`,
      summary: `Api createFootprint`,
    },
  })
  async createFootprint(
    @Body() body: CreateFootprintBodyDto,
  ): Promise<CreateFootprintResponseDto> {
    return this.footprintService.createFootprint(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetFootprintListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getFootprintList`,
      summary: `Api getFootprintList`,
    },
  })
  async getFootprintList(
    @Query() query: GetFootprintListQueryDto,
  ): Promise<PaginationResponseDto<GetFootprintListResponseDto>> {
    return this.footprintService.getFootprintList(query);
  }

  @Get('fake')
  @SwaggerApiDocument({
    response: {
      type: GetFootprintListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getFootprintFake`,
      summary: `Api getFootprintFake`,
    },
  })
  async getFootprintFake(
    @Query() query: GetFootprintListQueryDto,
  ): Promise<PaginationResponseDto<GetFootprintListResponseDto>> {
    return this.footprintService.getFootprintFake(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetFootprintDetailResponseDto,
    },
    operation: {
      operationId: `getFootprintDetail`,
      summary: `Api getFootprintDetail`,
    },
  })
  async getFootprintDetail(
    @Param('id') id: number,
  ): Promise<GetFootprintDetailResponseDto> {
    return this.footprintService.getFootprintDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateFootprintResponseDto,
    },
    body: { type: UpdateFootprintBodyDto, required: true },
    operation: {
      operationId: `updateFootprint`,
      summary: `Api updateFootprint`,
    },
  })
  async updateFootprint(
    @Param('id') id: number,
    @Body() body: UpdateFootprintBodyDto,
  ): Promise<UpdateFootprintResponseDto> {
    return this.footprintService.updateFootprint(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteFootprint`,
      summary: `Api deleteFootprint`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFootprint(@Param('id') id: number): Promise<void> {
    await this.footprintService.deleteFootprint(id);
  }
}
