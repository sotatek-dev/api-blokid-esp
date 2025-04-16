import { PartialType } from '@nestjs/swagger';
import { Gender, UserLanguage, UserRole, UserStatus } from '@prisma/client';
import { IsEmail } from 'class-validator';
import { PaginationQueryDto } from 'src/core/platform/dtos';
import { PropertyDto } from 'src/decorators';
import { BaseExecutiveCompanyResponseDto } from 'src/modules/executive/company/dtos';

// Auto generated by tools/generate-dtos.ts at 2025-04-09T07:25:56.618Z
// ****************************** Base User response dto ******************************
export class BaseUserResponseDto {
  @PropertyDto()
  id: number;

  @PropertyDto()
  email: string;

  @PropertyDto()
  fullName: string;

  @PropertyDto()
  phoneNumber: string;

  @PropertyDto()
  status: UserStatus;

  @PropertyDto()
  dob: Date;

  @PropertyDto()
  role: UserRole;

  @PropertyDto()
  gender: Gender;

  @PropertyDto()
  address: string;

  @PropertyDto()
  imageLink: string;

  @PropertyDto()
  lastActive: Date;

  @PropertyDto()
  language: UserLanguage;
}

// ****************************** GET User dto ******************************
export class GetUserDetailResponseDto extends BaseUserResponseDto {
  // Add more fields if needed such as relations
  @PropertyDto({
    type: BaseExecutiveCompanyResponseDto,
    structure: 'array',
  })
  ExecutiveCompany: BaseExecutiveCompanyResponseDto[];
}

export class GetUserListResponseDto extends BaseUserResponseDto {
  // Add more fields if needed such as relations
}

export class GetUserListQueryDto extends PaginationQueryDto {
  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  id: number;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  @IsEmail()
  email: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  password: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  fullName: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  phoneNumber: string;

  @PropertyDto({
    type: UserStatus,
    required: false,
    validated: true,
    structure: 'enum',
  })
  status: UserStatus;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  dobRangeStart: Date;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  dobRangeEnd: Date;

  @PropertyDto({
    type: UserRole,
    required: false,
    validated: true,
    structure: 'enum',
  })
  role: UserRole;

  @PropertyDto({
    type: Gender,
    required: false,
    validated: true,
    structure: 'enum',
  })
  gender: Gender;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  address: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  imageLink: string;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  lastActiveRangeStart: Date;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  lastActiveRangeEnd: Date;

  @PropertyDto({
    type: Boolean,
    required: false,
    validated: true,
  })
  forceResetPassword: boolean;

  @PropertyDto({
    type: UserLanguage,
    required: false,
    validated: true,
    structure: 'enum',
  })
  language: UserLanguage;

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

// ****************************** CREATE User dto ******************************
export class CreateUserBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
  })
  @IsEmail()
  email: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  fullName: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  phoneNumber: string;

  @PropertyDto({
    type: Date,
    required: false,
    validated: true,
  })
  dob: Date;

  @PropertyDto({
    type: UserRole,
    required: true,
    validated: true,
    structure: 'enum',
  })
  role: UserRole;

  @PropertyDto({
    type: Gender,
    required: true,
    validated: true,
    structure: 'enum',
  })
  gender: Gender;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  address: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  imageLink: string;

  @PropertyDto({
    type: UserLanguage,
    required: false,
    validated: true,
    structure: 'enum',
  })
  language: UserLanguage;
}

export class CreateUserResponseDto extends BaseUserResponseDto {}

// ****************************** UPDATE User dto ******************************
export class UpdateUserBodyDto extends PartialType(CreateUserBodyDto) {
  // User OmitType if needed
}

export class UpdateUserResponseDto extends BaseUserResponseDto {}

// ****************************** More User dto below ******************************
