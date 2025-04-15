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
  CreateTargetPersonBodyDto,
  CreateTargetPersonResponseDto,
  EnrichPeopleBodyDto,
  EnrichPeopleResponseDto,
  GetTargetPersonDetailResponseDto,
  GetTargetPersonListQueryDto,
  GetTargetPersonListResponseDto,
  UpdateTargetPersonBodyDto,
  UpdateTargetPersonResponseDto,
  UploadTargetPersonListBodyDto,
  UploadTargetPersonListResponseDto,
} from './dtos';
import { TargetPersonService } from './target-person.service';

@Controller('target-person')
@ApiTags('Target Person')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class TargetPersonController {
  constructor(private readonly targetPersonService: TargetPersonService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateTargetPersonResponseDto,
    },
    body: { type: CreateTargetPersonBodyDto, required: true },
    operation: {
      operationId: `createTargetPerson`,
      summary: `Api createTargetPerson`,
    },
  })
  async createTargetPerson(
    @Body() body: CreateTargetPersonBodyDto,
  ): Promise<CreateTargetPersonResponseDto> {
    return this.targetPersonService.createTargetPerson(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetTargetPersonDetailResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getTargetPersonList`,
      summary: `Api getTargetPersonList`,
    },
  })
  async getTargetPersonList(
    @Query() query: GetTargetPersonListQueryDto,
  ): Promise<PaginationResponseDto<GetTargetPersonListResponseDto>> {
    return this.targetPersonService.getTargetPersonList(query);
  }

  @Post(`upload`)
  @SwaggerApiDocument({
    response: {
      type: UploadTargetPersonListResponseDto,
    },
    body: { type: UploadTargetPersonListBodyDto, required: true },
    operation: {
      operationId: `uploadTargetPersonList`,
      summary: `Api uploadTargetPersonList`,
    },
  })
  async uploadTargetPersonList(
    @Body() body: UploadTargetPersonListBodyDto,
  ): Promise<UploadTargetPersonListResponseDto> {
    return this.targetPersonService.uploadTargetPersonList(body);
  }

  @Post(`enrichments`)
  @SwaggerApiDocument({
    response: {
      type: EnrichPeopleResponseDto,
    },
    body: { type: EnrichPeopleBodyDto, required: true },
    operation: {
      operationId: `enrichPeople`,
      summary: `Api enrichPeople`,
    },
  })
  async enrichPeople(
    @Body() body: EnrichPeopleBodyDto,
  ): Promise<EnrichPeopleResponseDto> {
    return this.targetPersonService.enrichPeople(body);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetTargetPersonDetailResponseDto,
    },
    operation: {
      operationId: `getTargetPersonDetail`,
      summary: `Api getTargetPersonDetail`,
    },
  })
  async getTargetPersonDetail(
    @Param('id') id: number,
  ): Promise<GetTargetPersonDetailResponseDto> {
    return this.targetPersonService.getTargetPersonDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateTargetPersonResponseDto,
    },
    body: { type: UpdateTargetPersonBodyDto, required: true },
    operation: {
      operationId: `updateTargetPerson`,
      summary: `Api updateTargetPerson`,
    },
  })
  async updateTargetPerson(
    @Param('id') id: number,
    @Body() body: UpdateTargetPersonBodyDto,
  ): Promise<UpdateTargetPersonResponseDto> {
    return this.targetPersonService.updateTargetPerson(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteTargetPerson`,
      summary: `Api deleteTargetPerson`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTargetPerson(@Param('id') id: number): Promise<void> {
    await this.targetPersonService.deleteTargetPerson(id);
  }
}
