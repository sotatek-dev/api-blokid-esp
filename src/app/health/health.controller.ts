import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { AccessRole } from 'src/common/enums';
import { ServerConfig } from 'src/core/config';
import { RoleBaseAccessControl } from 'src/decorators';
import { DatabaseService } from 'src/modules/base/database/database.service';

/**
 * When using terminus which can throw Error then be very careful of
 * "Send double response" problem cause server to crash
 * @fix add timeout
 **/
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@ApiTags('Application')
@RoleBaseAccessControl(AccessRole.Public)
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    // private readonly http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly databaseService: DatabaseService,
  ) {}

  // @Get(`http`)
  // @ApiOperation({
  //   operationId: `httpHealthCheck`,
  //   summary: 'Api httpHealthCheck',
  // })
  // @HealthCheck()
  // httpHealthCheck() {
  //   const timeout = ServerConfig.get().HTTP_REQUEST_TIMEOUT / 2;
  //   return this.health.check([
  //     () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com', { timeout }),
  //   ]);
  // }

  @Get(`disk`)
  @ApiOperation({
    operationId: `diskHealthCheck`,
    summary: 'Api diskHealthCheck',
  })
  @HealthCheck()
  diskHealthCheck() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }

  @Get(`memory`)
  @ApiOperation({
    operationId: `memoryHealthCheck`,
    summary: 'Api memoryHealthCheck',
  })
  @HealthCheck()
  memoryHealthCheck() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get(`prisma`)
  @ApiOperation({
    operationId: `prismaHealthCheck`,
    summary: 'Api prismaHealthCheck',
  })
  @HealthCheck()
  prismaHealthCheck() {
    const timeout = ServerConfig.get().HTTP_REQUEST_TIMEOUT / 2;
    return this.health.check([
      () => this.prisma.pingCheck('prisma_connection', this.databaseService, { timeout }),
    ]);
  }
}
