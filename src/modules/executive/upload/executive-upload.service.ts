import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isEmail, isURL } from 'class-validator';
import { ERROR_RESPONSE } from 'src/common/const';
import { csvFileMimeTypes } from 'src/common/const/file.const';
import { parseCsv } from 'src/common/helpers/csv';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { AsyncStorage } from 'src/core/async-storage';
import { _ } from 'src/core/libs/lodash';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import { EXECUTIVE_CSV_HEADERS } from 'src/modules/executive/executive.const';
import { EXECUTIVE_COLUMN_POSITION } from 'src/modules/executive/executive.types';
import {
  CreateExecutiveUploadBodyDto,
  GetExecutiveUploadListQueryDto,
  SaveExecutiveUploadBodyDto,
} from './dtos';

@Injectable()
export class ExecutiveUploadService {
  constructor(private databaseService: DatabaseService) {}

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
    // validate csv content
    const emails: string[] = [];
    const fullNames: string[] = [];
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
      if (!isURL(linkedIn)) {
        throw new ServerException({
          ...ERROR_RESPONSE.INVALID_FILES,
          message: 'Invalid csv content. LinkedIn URL is invalid',
          details: { row, linkedIn: row[EXECUTIVE_COLUMN_POSITION.linkedIn] },
        });
      }
      emails.push(email);
      fullNames.push(fullName);
    });

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
        position: row[EXECUTIVE_COLUMN_POSITION.position],
        executiveCompanyId: upload.ExecutiveCompany.id,
      });
    });

    const persons = await this.databaseService.executivePerson.createMany({
      data: executives,
    });
    return { ...persons, expect: upload.quantity };
  }
}
