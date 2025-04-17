import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ServerConfig } from 'server-config/index';
import { csvFileMimeTypes } from 'src/common/const/file.const';
import { AccessRole } from 'src/common/enums';
import { BodyContentType, MulterFile } from 'src/core/platform';
import { PaginationResponseDto } from 'src/core/platform/dtos';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorators';
import { AuthGuard } from 'src/guards';
import { EXECUTIVE_CSV_HEADERS } from 'src/modules/executive/executive.const';
import {
  CreateExecutiveUploadBodyDto,
  CreateExecutiveUploadQueryDto,
  CreateExecutiveUploadResponseDto,
  EnrichExecutiveUploadBodyDto,
  EnrichExecutiveUploadResponseDto,
  GetExecutiveUploadDetailResponseDto,
  GetExecutiveUploadListQueryDto,
  GetExecutiveUploadListResponseDto,
  SaveExecutiveUploadBodyDto,
  SaveExecutiveUploadResponseDto,
} from './dtos';
import { ExecutiveUploadService } from './executive-upload.service';

@Controller('executive/upload')
@ApiTags('Executive Upload')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class ExecutiveUploadController {
  private static readonly storage = diskStorage({
    destination: ServerConfig.get().EXECUTIVE_STORAGE_PATH,
  });

  constructor(private readonly executiveUploadService: ExecutiveUploadService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: CreateExecutiveUploadResponseDto,
    },
    body: { type: CreateExecutiveUploadBodyDto, required: true },
    contentType: [BodyContentType.MultipartFormData],
    operation: {
      operationId: `createExecutiveUpload`,
      summary: `Api createExecutiveUpload`,
      description: `Upload csv file content executive for enrichment<br>
      <li>Accepts mimetype: ${csvFileMimeTypes.join(', ')}</li>
      <li>Headers: ${EXECUTIVE_CSV_HEADERS.join(', ')}</li>
      `,
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: ExecutiveUploadController.storage,
    }),
  )
  async createExecutiveUpload(
    @UploadedFile() file: MulterFile,
    @Query() query: CreateExecutiveUploadQueryDto,
    @Body() body: CreateExecutiveUploadBodyDto,
  ): Promise<CreateExecutiveUploadResponseDto> {
    return this.executiveUploadService.createExecutiveUpload(query, { ...body, file });
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetExecutiveUploadListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getExecutiveUploadList`,
      summary: `Api getExecutiveUploadList`,
    },
  })
  async getExecutiveUploadList(
    @Query() query: GetExecutiveUploadListQueryDto,
  ): Promise<PaginationResponseDto<GetExecutiveUploadListResponseDto>> {
    return this.executiveUploadService.getExecutiveUploadList(query);
  }

  @Post('save')
  @SwaggerApiDocument({
    response: {
      type: SaveExecutiveUploadResponseDto,
    },
    body: { type: SaveExecutiveUploadBodyDto, required: true },
    operation: {
      operationId: `saveExecutiveUpload`,
      summary: `Api saveExecutiveUpload`,
    },
  })
  async saveExecutiveUpload(
    @Body() body: SaveExecutiveUploadBodyDto,
  ): Promise<SaveExecutiveUploadResponseDto> {
    return this.executiveUploadService.saveExecutiveUpload(body);
  }

  @Post('enrich')
  @SwaggerApiDocument({
    response: {
      type: EnrichExecutiveUploadResponseDto,
    },
    body: { type: EnrichExecutiveUploadBodyDto, required: true },
    operation: {
      operationId: `enrichExecutiveUpload`,
      summary: `Api enrichExecutiveUpload`,
    },
  })
  async enrichExecutiveUpload(
    @Body() body: EnrichExecutiveUploadBodyDto,
  ): Promise<EnrichExecutiveUploadResponseDto> {
    return this.executiveUploadService.enrichExecutiveUpload(body);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: {
      type: GetExecutiveUploadDetailResponseDto,
    },
    operation: {
      operationId: `getExecutiveUploadDetail`,
      summary: `Api getExecutiveUploadDetail`,
    },
  })
  async getExecutiveUploadDetail(
    @Param('id') id: number,
  ): Promise<GetExecutiveUploadDetailResponseDto> {
    return this.executiveUploadService.getExecutiveUploadDetail(id);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.NO_CONTENT,
    },
    operation: {
      operationId: `deleteExecutiveUpload`,
      summary: `Api deleteExecutiveUpload`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExecutiveUpload(@Param('id') id: number): Promise<void> {
    await this.executiveUploadService.deleteExecutiveUpload(id);
  }
}
