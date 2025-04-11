import { Controller, Get, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerConfig } from 'server-config/index';
import { AccessRole } from 'src/common/enums';
import { timeoutFor } from 'src/common/helpers/promise';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorators';

@Controller({ version: VERSION_NEUTRAL })
@ApiTags('Application')
@RoleBaseAccessControl(AccessRole.Public)
export class AppController {
  @Get('timeout')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.CREATED,
    },
    operation: {
      operationId: `requestTimeout`,
      summary: `Api requestTimeout`,
    },
    extra: { isPublic: true },
  })
  async requestTimeout(): Promise<any> {
    return timeoutFor(ServerConfig.get().HTTP_REQUEST_TIMEOUT * 2);
  }

  @Get('paginationCheck')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: Object,
      isPagination: true,
    },
    operation: {
      operationId: `paginationCheck`,
      summary: 'Api paginationCheck',
    },
    extra: { isPublic: true },
  })
  @HttpCode(HttpStatus.OK)
  async paginationCheck(): Promise<object> {
    return { a: ``, b: null, c: undefined };
  }

  @Get('errorCheck')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: Object,
      isPagination: true,
    },
    operation: {
      operationId: `errorCheck`,
      summary: 'Api errorCheck',
    },
    extra: { isPublic: true },
  })
  @HttpCode(HttpStatus.OK)
  errorCheck(): object {
    throw new Error(
      `AppController.errorCheck check app behavior when pure Error instance is thrown`,
    );
  }
}
