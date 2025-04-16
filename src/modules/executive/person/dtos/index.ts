import { PartialType } from '@nestjs/swagger';
import { EnrichmentStatus } from '@prisma/client';
import { MulterFile } from 'src/core/platform';
import { PaginationQueryDto } from 'src/core/platform/dtos';
import { PropertyDto } from 'src/decorators';

// Auto generated by tools/generate-dtos.ts at 2025-04-15T10:09:18.779Z
// ****************************** Base ExecutivePerson response dto ******************************
export class BaseExecutivePersonResponseDto {
  @PropertyDto()
  id: number;

  @PropertyDto()
  firstName: string;

  @PropertyDto()
  lastName: string;

  @PropertyDto()
  fullName: string;

  @PropertyDto()
  linkedinProfileUrl: string;

  @PropertyDto()
  email: string;

  @PropertyDto()
  phoneNumber: string;

  @PropertyDto()
  position: string;

  @PropertyDto()
  department: string;

  @PropertyDto()
  enrichmentStatus: EnrichmentStatus;

  @PropertyDto()
  intentScore: number;

  @PropertyDto()
  targetCompanyId: number;

  @PropertyDto()
  createdAt: Date;
}

// ****************************** GET ExecutivePerson dto ******************************
export class GetExecutivePersonDetailResponseDto extends BaseExecutivePersonResponseDto {
  // Add more fields if needed such as relations
}

export class GetExecutivePersonListResponseDto extends BaseExecutivePersonResponseDto {
  // Add more fields if needed such as relations
}

export class GetExecutivePersonListQueryDto extends PaginationQueryDto {
  @PropertyDto({
    type: String,
    required: false,
    validated: true,
    description: `Search by full name which contain your input`,
  })
  name: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
    description: `Search by position which contain your input`,
  })
  position: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
    description: `Search by department which contain your input`,
  })
  department: string;

  @PropertyDto({
    type: EnrichmentStatus,
    required: false,
    validated: true,
    structure: 'enumArray',
    example: [EnrichmentStatus.Completed],
  })
  enrichmentStatus: EnrichmentStatus[];

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  intentScoreRangeStart: number;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  intentScoreRangeEnd: number;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  targetCompanyId: number;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  createdAtRangeStart: Date;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  createdAtRangeEnd: Date;
}

// ****************************** CREATE ExecutivePerson dto ******************************
export class CreateExecutivePersonBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
  })
  firstName: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
  })
  lastName: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
  })
  linkedinProfileUrl: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  email: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  phoneNumber: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  position: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  department: string;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
    example: 1,
  })
  targetCompanyId: number;

  @PropertyDto({
    type: EnrichmentStatus,
    required: false,
    validated: true,
    structure: 'enum',
  })
  enrichmentStatus: EnrichmentStatus;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  intentScore: number;
}

export class CreateExecutivePersonResponseDto extends BaseExecutivePersonResponseDto {}

// ****************************** UPDATE ExecutivePerson dto ******************************
export class UpdateExecutivePersonBodyDto extends PartialType(
  CreateExecutivePersonBodyDto,
) {
  // User OmitType if needed
}

export class UpdateExecutivePersonResponseDto extends BaseExecutivePersonResponseDto {}

// ****************************** uploadExecutive ******************************

export class UploadExecutiveResponseDto {}

export class UploadExecutiveBodyDto {
  @PropertyDto({
    type: 'file',
    required: true,
    validated: true,
  })
  file: MulterFile;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  targetCompanyId: number;
}

// ****************************** enrichPeople ******************************

export class EnrichPeopleResponseDto {}

export class EnrichPeopleBodyDto {
  @PropertyDto({
    type: [String],
    required: true,
    validated: true,
  })
  emails: string[];

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  targetCompanyId: number;
}

// ****************************** getExecutivePersonDepartment ******************************
