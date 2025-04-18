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
  CreateExecutivePersonBodyDto,
  CreateExecutivePersonResponseDto,
  GetExecutivePersonDepartmentQueryDto,
  GetExecutivePersonDepartmentResponseDto,
  GetExecutivePersonDetailResponseDto,
  GetExecutivePersonListQueryDto,
  GetExecutivePersonListResponseDto,
  GetExecutivePersonPositionQueryDto,
  GetExecutivePersonPositionResponseDto,
  UpdateExecutivePersonBodyDto,
  UpdateExecutivePersonResponseDto,
} from './dtos';
import { ExecutivePersonService } from './executive-person.service';

@Controller('executive/person')
@ApiTags('Executive Person')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class ExecutivePersonController {
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
      type: GetExecutivePersonListResponseDto,
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

  @Get('departments')
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonDepartmentResponseDto,
    },
    operation: {
      operationId: `getExecutivePersonDepartment`,
      summary: `Api getExecutivePersonDepartment`,
    },
  })
  async getExecutivePersonDepartment(
    @Query() query: GetExecutivePersonDepartmentQueryDto,
  ): Promise<GetExecutivePersonDepartmentResponseDto> {
    return this.personService.getExecutivePersonDepartment(query);
  }

  @Get('positions')
  @SwaggerApiDocument({
    response: {
      type: GetExecutivePersonPositionResponseDto,
    },
    operation: {
      operationId: `getExecutivePersonPosition`,
      summary: `Api getExecutivePersonPosition`,
    },
  })
  async getExecutivePersonPosition(
    @Query() query: GetExecutivePersonPositionQueryDto,
  ): Promise<GetExecutivePersonPositionResponseDto> {
    return this.personService.getExecutivePersonPosition(query);
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
