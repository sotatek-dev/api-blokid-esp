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
  CreateTargetCompanyBodyDto,
  CreateTargetCompanyResponseDto,
  GetTargetCompanyDetailResponseDto,
  GetTargetCompanyListQueryDto,
  GetTargetCompanyListResponseDto,
  UpdateTargetCompanyBodyDto,
  UpdateTargetCompanyResponseDto,
} from './dtos';
import { TargetCompanyService } from './target-company.service';

@Controller('target-company')
@ApiTags('Target Company')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class TargetCompanyController {
  constructor(private readonly targetCompanyService: TargetCompanyService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateTargetCompanyResponseDto,
    },
    body: { type: CreateTargetCompanyBodyDto, required: true },
    operation: {
      operationId: `createTargetCompany`,
      summary: `Api createTargetCompany`,
    },
  })
  async createTargetCompany(
    @Body() body: CreateTargetCompanyBodyDto,
  ): Promise<CreateTargetCompanyResponseDto> {
    return this.targetCompanyService.createTargetCompany(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetTargetCompanyDetailResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getTargetCompanyList`,
      summary: `Api getTargetCompanyList`,
    },
  })
  async getTargetCompanyList(
    @Query() query: GetTargetCompanyListQueryDto,
  ): Promise<PaginationResponseDto<GetTargetCompanyListResponseDto>> {
    return this.targetCompanyService.getTargetCompanyList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetTargetCompanyDetailResponseDto,
    },
    operation: {
      operationId: `getTargetCompanyDetail`,
      summary: `Api getTargetCompanyDetail`,
    },
  })
  async getTargetCompanyDetail(
    @Param('id') id: number,
  ): Promise<GetTargetCompanyDetailResponseDto> {
    return this.targetCompanyService.getTargetCompanyDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateTargetCompanyResponseDto,
    },
    body: { type: UpdateTargetCompanyBodyDto, required: true },
    operation: {
      operationId: `updateTargetCompany`,
      summary: `Api updateTargetCompany`,
    },
  })
  async updateTargetCompany(
    @Param('id') id: number,
    @Body() body: UpdateTargetCompanyBodyDto,
  ): Promise<UpdateTargetCompanyResponseDto> {
    return this.targetCompanyService.updateTargetCompany(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteTargetCompany`,
      summary: `Api deleteTargetCompany`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTargetCompany(@Param('id') id: number): Promise<void> {
    await this.targetCompanyService.deleteTargetCompany(id);
  }
}
