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
  CreateExecutiveCompanyBodyDto,
  CreateExecutiveCompanyResponseDto,
  GetExecutiveCompanyDetailResponseDto,
  GetExecutiveCompanyListQueryDto,
  GetExecutiveCompanyListResponseDto,
  UpdateExecutiveCompanyBodyDto,
  UpdateExecutiveCompanyResponseDto,
} from './dtos';
import { ExecutiveCompanyService } from './executive-company.service';

@Controller('executive/company')
@ApiTags('Executive Company')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class ExecutiveCompanyController {
  constructor(private readonly executiveCompanyService: ExecutiveCompanyService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateExecutiveCompanyResponseDto,
    },
    body: { type: CreateExecutiveCompanyBodyDto, required: true },
    operation: {
      operationId: `createExecutiveCompany`,
      summary: `Api createExecutiveCompany`,
    },
  })
  async createExecutiveCompany(
    @Body() body: CreateExecutiveCompanyBodyDto,
  ): Promise<CreateExecutiveCompanyResponseDto> {
    return this.executiveCompanyService.createExecutiveCompany(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetExecutiveCompanyListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getExecutiveCompanyList`,
      summary: `Api getExecutiveCompanyList`,
    },
  })
  async getExecutiveCompanyList(
    @Query() query: GetExecutiveCompanyListQueryDto,
  ): Promise<PaginationResponseDto<GetExecutiveCompanyListResponseDto>> {
    return this.executiveCompanyService.getExecutiveCompanyList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetExecutiveCompanyDetailResponseDto,
    },
    operation: {
      operationId: `getExecutiveCompanyDetail`,
      summary: `Api getExecutiveCompanyDetail`,
    },
  })
  async getExecutiveCompanyDetail(
    @Param('id') id: number,
  ): Promise<GetExecutiveCompanyDetailResponseDto> {
    return this.executiveCompanyService.getExecutiveCompanyDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateExecutiveCompanyResponseDto,
    },
    body: { type: UpdateExecutiveCompanyBodyDto, required: true },
    operation: {
      operationId: `updateExecutiveCompany`,
      summary: `Api updateExecutiveCompany`,
    },
  })
  async updateExecutiveCompany(
    @Param('id') id: number,
    @Body() body: UpdateExecutiveCompanyBodyDto,
  ): Promise<UpdateExecutiveCompanyResponseDto> {
    return this.executiveCompanyService.updateExecutiveCompany(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteExecutiveCompany`,
      summary: `Api deleteExecutiveCompany`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExecutiveCompany(@Param('id') id: number): Promise<void> {
    await this.executiveCompanyService.deleteExecutiveCompany(id);
  }
}
