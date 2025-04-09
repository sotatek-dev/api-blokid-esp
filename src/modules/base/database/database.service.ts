import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { getCurrentDate } from 'src/common/helpers/time';
import { _ } from 'src/core/libs/lodash';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.$use(this.softDeleteMiddleware);
    this.$use(this.findManyByCreatedTimeDesc);
  }

  private async findManyByCreatedTimeDesc(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<void>,
  ) {
    switch (params.action) {
      case 'findMany':
        if (!_.has(params, 'args.orderBy')) {
          _.set(params, 'args.orderBy', { createdAt: Prisma.SortOrder.desc });
        }
        break;
      default:
    }

    return next(params);
  }

  private async softDeleteMiddleware(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<void>,
  ) {
    switch (params.action) {
      case 'findFirst':
      case 'update':
      case 'findMany':
      case 'findUnique':
      case 'updateMany':
      case 'findFirstOrThrow':
      case 'findUniqueOrThrow':
      case 'count':
      case 'upsert':
      case 'aggregate':
      case 'groupBy':
        _.set(params, 'args.where.deletedAt', null);
        break;
      case 'delete':
      case 'deleteMany':
        params.action = params.action === 'delete' ? 'update' : 'updateMany';
        _.set(params, 'args.where.deletedAt', null);
        _.set(params, 'args.data.deletedAt', getCurrentDate());
        break;
      default:
    }

    return next(params);
  }
}
