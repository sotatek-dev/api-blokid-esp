import { PropertyDto } from 'src/decorators/property-dto.decorator';

export class LoginResponseDto {
  @PropertyDto()
  accessToken: string;

  @PropertyDto()
  refreshToken: string;
}

export class LoginBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'temporary001@email.com',
  })
  email: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'Sota@001',
  })
  password: string;
}

// ****************************** ForgetPassword ******************************
export class ForgetPasswordResponseDto {}

export class ForgetPasswordBodyDto {}

// ****************************** ChangePassword ******************************
export class ChangePasswordResponseDto {}

export class ChangePasswordBodyDto extends LoginBodyDto {}

// ******************************  RefreshToken ******************************
export class RefreshTokenResponseDto extends LoginResponseDto {}
