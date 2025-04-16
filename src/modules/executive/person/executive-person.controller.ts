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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ServerConfig } from 'server-config/index';
import { xlsxFileMimeTypes } from 'src/common/const/file.const';
import { AccessRole } from 'src/common/enums';
import { BodyContentType, MulterFile } from 'src/core/platform';
import { PaginationResponseDto } from 'src/core/platform/dtos';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorators';
import { AuthGuard } from 'src/guards';
import {
  CreateExecutivePersonBodyDto,
  CreateExecutivePersonResponseDto,
  EnrichPeopleBodyDto,
  EnrichPeopleResponseDto,
  GetExecutivePersonDetailResponseDto,
  GetExecutivePersonListQueryDto,
  GetExecutivePersonListResponseDto,
  UpdateExecutivePersonBodyDto,
  UpdateExecutivePersonResponseDto,
  UploadExecutiveBodyDto,
  UploadExecutiveResponseDto,
} from './dtos';
import { ExecutivePersonService } from './executive-person.service';

@Controller('executive/person')
@ApiTags('Executive Person')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class ExecutivePersonController {
  private static readonly storage = diskStorage({
    destination: ServerConfig.get().EXECUTIVE_STORAGE_PATH,
  });

  constructor(private readonly personService: ExecutivePersonService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateExecutivePersonResponseDto,
    },
    body: { type: CreateExecutivePersonBodyDto, required: true },
    operation: {
      operationId: `createExecutivePerson`,
      summary: `Api createExecutivePerson`,
    },
  })
  async createExecutivePerson(
    @Body() body: CreateExecutivePersonBodyDto,
  ): Promise<CreateExecutivePersonResponseDto> {
    return this.personService.createExecutivePerson(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonDetailResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getExecutivePersonList`,
      summary: `Api getExecutivePersonList`,
    },
  })
  async getExecutivePersonList(
    @Query() query: GetExecutivePersonListQueryDto,
  ): Promise<PaginationResponseDto<GetExecutivePersonListResponseDto>> {
    return this.personService.getExecutivePersonList(query);
  }

  @Get('department')
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getExecutivePersonDepartment`,
      summary: `Api getExecutivePersonDepartment`,
    },
  })
  async getExecutivePersonDepartment(
    @Query() query: GetExecutivePersonListQueryDto,
  ): Promise<PaginationResponseDto<GetExecutivePersonListResponseDto>> {
    return this.personService.getExecutivePersonDepartment(query);
  }

  @Get('position')
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonDetailResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getExecutivePersonPosition`,
      summary: `Api getExecutivePersonPosition`,
    },
  })
  async getExecutivePersonPosition(
    @Query() query: GetExecutivePersonListQueryDto,
  ): Promise<PaginationResponseDto<GetExecutivePersonListResponseDto>> {
    return this.personService.getExecutivePersonPosition(query);
  }

  @Post(`upload`)
  @SwaggerApiDocument({
    response: {
      type: UploadExecutiveResponseDto,
    },
    contentType: [BodyContentType.MultipartFormData],
    body: { type: UploadExecutiveBodyDto, required: true },
    operation: {
      operationId: `uploadExecutive`,
      summary: `Api uploadExecutive`,
      description: `Accepts mimetype: ${xlsxFileMimeTypes}`,
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: ExecutivePersonController.storage,
    }),
  )
  async uploadExecutive(
    @UploadedFile() file: MulterFile,
    @Body() body: UploadExecutiveBodyDto,
  ): Promise<UploadExecutiveResponseDto> {
    return this.personService.uploadExecutive({ ...body, file });
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
    return this.personService.enrichPeople(body);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonDetailResponseDto,
    },
    operation: {
      operationId: `getExecutivePersonDetail`,
      summary: `Api getExecutivePersonDetail`,
    },
  })
  async getExecutivePersonDetail(
    @Param('id') id: number,
  ): Promise<GetExecutivePersonDetailResponseDto> {
    return this.personService.getExecutivePersonDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: {
      type: UpdateExecutivePersonResponseDto,
    },
    body: { type: UpdateExecutivePersonBodyDto, required: true },
    operation: {
      operationId: `updateExecutivePerson`,
      summary: `Api updateExecutivePerson`,
    },
  })
  async updateExecutivePerson(
    @Param('id') id: number,
    @Body() body: UpdateExecutivePersonBodyDto,
  ): Promise<UpdateExecutivePersonResponseDto> {
    return this.personService.updateExecutivePerson(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteExecutivePerson`,
      summary: `Api deleteExecutivePerson`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExecutivePerson(@Param('id') id: number): Promise<void> {
    await this.personService.deleteExecutivePerson(id);
  }
}
