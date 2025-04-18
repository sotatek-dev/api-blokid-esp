import { HttpStatus, Injectable } from '@nestjs/common';
import { EnrichmentStatus, EnrichmentType, Prisma } from '@prisma/client';
import { isEmail, isEmpty, isURL } from 'class-validator';
import { BulkPersonEnrichmentRequest } from 'peopledatalabs/dist/types/bulk-types';
import { ERROR_RESPONSE } from 'src/common/const';
import { csvFileMimeTypes } from 'src/common/const/file.const';
import { parseCsv } from 'src/common/helpers/csv';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { AsyncStorage } from 'src/core/async-storage';
import { _ } from 'src/core/libs/lodash';
import { ServerLogger } from 'src/core/logger';
import { ServerException } from 'src/exceptions';
import { PeopleDataLabService } from 'src/integrations/peopledatalab';
import { DatabaseService } from 'src/modules/base/database';
import { EXECUTIVE_CSV_HEADERS } from 'src/modules/executive/executive.const';
import { EXECUTIVE_COLUMN_POSITION } from 'src/modules/executive/executive.types';
import {
  CreateExecutiveUploadBodyDto,
  EnrichExecutiveUploadBodyDto,
  GetExecutiveUploadListQueryDto,
  SaveExecutiveUploadBodyDto,
} from './dtos';

@Injectable()
export class ExecutiveUploadService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly peopleDataLabService: PeopleDataLabService,
  ) {}

  async createExecutiveUpload(body: CreateExecutiveUploadBodyDto) {
    const { file } = body;

    if (!file) {
      throw new ServerException({
        ...ERROR_RESPONSE.UNPROCESSABLE_ENTITY,
        message: 'File is required',
      });
    }
    // only accept csv files
    if (!csvFileMimeTypes.includes(file.mimetype)) {
      throw new ServerException({
        ...ERROR_RESPONSE.INVALID_FILES,
        message: 'File type is not supported',
        details: { accept: csvFileMimeTypes, actual: file.mimetype },
      });
    }
    // parse and check headers
    const [headers, ...csvContent] = await parseCsv(file.path);
    _.forEach(EXECUTIVE_CSV_HEADERS, (header, index) => {
      if (header !== headers[index]) {
        throw new ServerException({
          ...ERROR_RESPONSE.INVALID_FILES,
          message: 'Invalid csv headers',
          details: { accept: EXECUTIVE_CSV_HEADERS, actual: headers },
        });
      }
    });
    // check csv content
    if (csvContent.length === 0) {
      throw new ServerException({
        ...ERROR_RESPONSE.INVALID_FILES,
        message: 'Invalid csv content. No data found',
      });
    }
    // validate csv content
    const conditions: Prisma.ExecutivePersonWhereInput[] = [];
    _.forEach(csvContent, (row) => {
      const email = row[EXECUTIVE_COLUMN_POSITION.email];
      const linkedIn = row[EXECUTIVE_COLUMN_POSITION.linkedIn];
      const firstName = row[EXECUTIVE_COLUMN_POSITION.firstName];
      const lastName = row[EXECUTIVE_COLUMN_POSITION.lastName];
      const fullName = `${firstName} ${lastName}`;
      if (!isEmail(email)) {
        throw new ServerException({
          ...ERROR_RESPONSE.INVALID_FILES,
          message: 'Invalid csv content. Email is invalid',
          details: { row, email },
        });
      }
      if (!isEmpty(linkedIn) && !isURL(linkedIn)) {
        throw new ServerException({
          ...ERROR_RESPONSE.INVALID_FILES,
          message: 'Invalid csv content. LinkedIn URL is invalid',
          details: { row, linkedIn: row[EXECUTIVE_COLUMN_POSITION.linkedIn] },
        });
      }
      conditions.push({ email, fullName });
    });

    const duplicated = await this.databaseService.executivePerson.findMany({
      where: { OR: [...conditions] },
    });

    // check for duplicated email and fullName, 10000 records = 5s
    // if (duplicated?.length > 0) {
    //   throw new ServerException({
    //     ...ERROR_RESPONSE.INVALID_FILES,
    //     message: 'Invalid csv content. Duplicated email or fullName',
    //     details: {
    //       duplicated: duplicated.map(({ email, fullName }) => ({ email, fullName })),
    //     },
    //   });
    // }

    // todo: only in MVP
    const userId = AsyncStorage.get('userId') as number;
    const user = await this.databaseService.user.findFirst({
      where: { id: userId },
      select: {
        Business: {
          select: { ExecutiveCompany: true },
        },
      },
    });

    return this.databaseService.executiveUpload.create({
      data: {
        fileName: file.originalname,
        filePath: file.path,
        quantity: csvContent.length,
        executiveCompanyId: user.Business.ExecutiveCompany[0].id,
      },
    });
  }

  async getExecutiveUploadList(query: GetExecutiveUploadListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.ExecutiveUploadWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.fileName && { fileName: query.fileName }),
      ...(query.filePath && { filePath: query.filePath }),
      ...(query.quantity && { quantity: query.quantity }),
      ...(query.storageLink && { storageLink: query.storageLink }),
      ...(query.executiveCompanyId && { executiveCompanyId: query.executiveCompanyId }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.executiveUpload.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.executiveUpload.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getExecutiveUploadDetail(id: number) {
    const executiveUpload = await this.databaseService.executiveUpload.findFirst({
      where: { id },
    });
    if (!executiveUpload) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return executiveUpload;
  }

  async deleteExecutiveUpload(id: number) {
    const executiveUpload = await this.databaseService.executiveUpload.findFirst({
      where: { id },
    });
    if (!executiveUpload) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executiveUpload.delete({ where: { id } });
  }

  async saveExecutiveUpload(body: SaveExecutiveUploadBodyDto) {
    const upload = await this.databaseService.executiveUpload.findFirst({
      where: { id: body.id },
      include: { ExecutiveCompany: true },
    });
    if (!upload) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    if (upload.isSaved) {
      throw new ServerException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Executive upload is already saved',
      });
    }

    const executives: Prisma.ExecutivePersonCreateManyInput[] = [];
    const { filePath } = upload;
    const [_headers, ...content] = await parseCsv(filePath);
    _.forEach(content, (row) => {
      const firstName = row[EXECUTIVE_COLUMN_POSITION.firstName];
      const lastName = row[EXECUTIVE_COLUMN_POSITION.lastName];
      executives.push({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: row[EXECUTIVE_COLUMN_POSITION.email],
        phoneNumber: row[EXECUTIVE_COLUMN_POSITION.phoneNumber],
        linkedinProfileUrl: row[EXECUTIVE_COLUMN_POSITION.linkedIn],
        executiveUploadId: upload.id,
        executiveCompanyId: upload.ExecutiveCompany.id,
      });
    });

    const persons = await this.databaseService.executivePerson.createMany({
      data: executives,
    });
    await this.databaseService.executiveUpload.update({
      where: { id: upload.id },
      data: { isSaved: true },
    });

    return { ...persons, expect: upload.quantity };
  }

  async enrichExecutiveUpload(body: EnrichExecutiveUploadBodyDto) {
    const upload = await this.databaseService.executiveUpload.findFirst({
      where: { id: body.id },
      include: { ExecutiveCompany: true },
    });

    if (!upload) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    // permission check
    const userId = AsyncStorage.get('userId') as number;
    const user = await this.databaseService.user.findFirst({
      where: { id: userId },
      include: { Business: true },
    });
    const executiveCompany = await this.databaseService.executiveCompany.findFirst({
      where: { businessId: user.Business.id, id: upload.executiveCompanyId },
    });
    if (!executiveCompany) {
      throw new ServerException({
        ...ERROR_RESPONSE.FORBIDDEN_RESOURCE,
        message: `You don't have permission to access this resource`,
      });
    }

    if (!upload.isSaved) {
      await this.saveExecutiveUpload({ id: upload.id });
    }

    const executives = await this.databaseService.executivePerson.findMany({
      where: { executiveUploadId: upload.id },
    });

    const enrichParams: BulkPersonEnrichmentRequest[] = _.map(executives, (executive) => {
      return {
        params: {
          name: executive.fullName,
          email: executive.email,
          profile: executive.linkedinProfileUrl,
          phone: executive.phoneNumber,
        },
        metadata: {
          executivePersonId: executive.id,
          email: executive.email,
        },
      };
    });

    const enrichmentRaw = await this.databaseService.enrichmentRaw.create({
      data: {
        request: enrichParams as object,
        type: EnrichmentType.Person,
      },
    });
    await this.databaseService.executivePerson.updateMany({
      where: { executiveUploadId: upload.id },
      data: { enrichmentStatus: EnrichmentStatus.InProgress },
    });

    this.peopleDataLabService
      .bulkPersonEnrichment(enrichParams)
      .then(async (enrichmentResponses) => {
        ServerLogger.info({
          message: 'Enrichment responses',
          context: `ExecutiveUploadService.enrichExecutiveUpload`,
          meta: {
            enrichParams,
            enrichmentResponses,
          },
        });
        await this.databaseService.enrichmentRaw.update({
          where: { id: enrichmentRaw.id },
          data: { response: enrichmentResponses as object },
        });

        const enrichedData: Prisma.PersonEnrichmentCreateManyInput[] = [];
        const enrichSuccessIds: number[] = [];
        const enrichFailIds: number[] = [];
        _.forEach(enrichmentResponses, (response) => {
          const personId = _.get(response, 'metadata.executivePersonId');
          const enrichData = response.data;
          enrichedData.push({
            executivePersonId: personId,
            fullName: _.get(enrichData, 'full_name'),
            email: _.get(enrichData, 'email'),
            position: _.get(enrichData, 'job_title'),
            linkedin: _.get(enrichData, 'linkedin'),
            companyName: _.get(enrichData, 'company_name'),
            companyAddress: _.get(enrichData, 'job_company_location_name'),
            gender: _.get(enrichData, 'sex'),
            // phoneNumber: _.get(enrichData, 'phone_numbers'),
            // address: _.get(enrichData, 'street_address'),
          });
          if (response.status === HttpStatus.OK) {
            enrichSuccessIds.push(personId);
          } else {
            enrichFailIds.push(personId);
          }
        });

        await this.databaseService.personEnrichment.createMany({
          data: enrichedData,
        });
        await this.databaseService.executivePerson.updateMany({
          where: { id: { in: enrichSuccessIds } },
          data: { enrichmentStatus: EnrichmentStatus.Completed },
        });
        await this.databaseService.executivePerson.updateMany({
          where: { id: { in: enrichFailIds } },
          data: { enrichmentStatus: EnrichmentStatus.Failed },
        });
      })
      .catch(async (error) => {
        ServerLogger.error({
          error,
          message: 'Enrichment error',
          context: `ExecutiveUploadService.enrichExecutiveUpload`,
        });
        await this.databaseService.enrichmentRaw.update({
          where: { id: enrichmentRaw.id },
          data: { response: error as object },
        });
        await this.databaseService.executivePerson.updateMany({
          where: { executiveUploadId: upload.id },
          data: { enrichmentStatus: EnrichmentStatus.Failed },
        });
      });

    return { inProgress: executives.length };
  }
}
