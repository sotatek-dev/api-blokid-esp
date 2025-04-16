import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isEmail, isURL } from 'class-validator';
import { ERROR_RESPONSE } from 'src/common/const';
import { csvFileMimeTypes } from 'src/common/const/file.const';
import { getCsvHeaders, parseCsv, parseCsvToObjects } from 'src/common/helpers/csv';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { AsyncStorage } from 'src/core/async-storage';
import { _ } from 'src/core/libs/lodash';
import { ServerException } from 'src/exceptions';
import { DatabaseService } from 'src/modules/base/database';
import { EXECUTIVE_CSV_HEADERS } from 'src/modules/executive/executive.const';
import { EXECUTIVE_COLUMN_POSITION } from 'src/modules/executive/executive.types';
import {
  CreateExecutivePersonBodyDto,
  EnrichPeopleBodyDto,
  GetExecutivePersonDepartmentQueryDto,
  GetExecutivePersonListQueryDto,
  GetExecutivePersonPositionQueryDto,
  UpdateExecutivePersonBodyDto,
  UploadExecutiveBodyDto,
} from './dtos';

@Injectable()
export class ExecutivePersonService {
  constructor(private databaseService: DatabaseService) {}

  async createExecutivePerson(body: CreateExecutivePersonBodyDto) {
    return this.databaseService.executivePerson.create({
      data: { ...body, fullName: `${body.firstName} ${body.lastName}` },
    });
  }

  async getExecutivePersonList(query: GetExecutivePersonListQueryDto) {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.ExecutivePersonWhereInput = {
      ...(query.name && { fullName: { contains: query.name } }),
      ...(query.department && { department: { contains: query.department } }),
      ...(query.enrichmentStatus && { enrichmentStatus: { in: query.enrichmentStatus } }),
      ...(query.targetCompanyId && { targetCompanyId: query.targetCompanyId }),
      ...(query.position && { position: { contains: query.position } }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }
    if (query.intentScoreRangeStart || query.intentScoreRangeEnd) {
      where.intentScore = {
        gte: query.intentScoreRangeStart,
        lte: query.intentScoreRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.executivePerson.findMany({
        where,
        take,
        skip,
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.executivePerson.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getExecutivePersonDetail(id: number) {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return executivePerson;
  }

  async updateExecutivePerson(id: number, body: UpdateExecutivePersonBodyDto) {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executivePerson.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteExecutivePerson(id: number) {
    const executivePerson = await this.databaseService.executivePerson.findFirst({
      where: { id },
    });
    if (!executivePerson) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.executivePerson.delete({ where: { id } });
  }

  async uploadExecutive(body: UploadExecutiveBodyDto) {
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
    _.forEach(csvContent, (row) => {
      const email = row[EXECUTIVE_COLUMN_POSITION.email];
      const linkedIn = row[EXECUTIVE_COLUMN_POSITION.linkedIn];
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
    });

    // todo: only in MVP
    const userId = AsyncStorage.get('userId') as number;
    const targetCompany = await this.databaseService.user.findFirst({
      where: { id: userId },
      select: {
        Business: {
          select: { TargetCompany: true },
        },
      },
    });

    return this.databaseService.executiveUpload.create({
      data: {
        fileName: file.originalname,
        filePath: file.path,
        quantity: csvContent.length,
        executiveCompanyId: targetCompany.Business.TargetCompany[0].id,
      },
    });
  }

  enrichPeople(body: EnrichPeopleBodyDto) {
    return undefined;
  }

  async getExecutivePersonDepartment(query: GetExecutivePersonDepartmentQueryDto) {
    const departments = await this.databaseService.executivePerson.findMany({
      where: {
        ...(query.search && { department: { contains: query.search } }),
      },
      select: {
        department: true,
      },
      distinct: ['department'],
    });
    return {
      departments: departments.map((department) => department.department),
    };
  }

  async getExecutivePersonPosition(query: GetExecutivePersonPositionQueryDto) {
    const positions = await this.databaseService.executivePerson.findMany({
      where: {
        ...(query.search && { position: { contains: query.search } }),
      },
      select: {
        position: true,
      },
      distinct: ['position'],
    });
    return {
      positions: positions.map((position) => position.position),
    };
  }
}
