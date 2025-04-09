import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl, SwaggerApiDocument, User } from 'src/decorators';
import { AuthGuard } from 'src/guards';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { UserJwtPayload } from 'src/modules/auth/auth.interface';
import {
  ChangePasswordBodyDto,
  ChangePasswordResponseDto,
  ForgetPasswordBodyDto,
  ForgetPasswordResponseDto,
  LoginBodyDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
} from 'src/modules/auth/dtos';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(AuthGuard)
@RoleBaseAccessControl(AccessRole.Admin)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: LoginResponseDto,
    },
    body: { type: LoginBodyDto, required: true },
    operation: {
      operationId: `login`,
      summary: `Api login`,
    },
    extra: { isPublic: true },
  })
  @RoleBaseAccessControl(AccessRole.Public)
  async login(@Body() body: LoginBodyDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  // @Post('forget-password')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: ForgetPasswordResponseDto,
    },
    body: { type: ForgetPasswordBodyDto, required: true },
    operation: {
      operationId: `forgetPassword`,
      summary: `Api forgetPassword`,
    },
    extra: { isPublic: true },
  })
  @RoleBaseAccessControl(AccessRole.Public)
  async forgetPassword(
    @Body() body: ForgetPasswordBodyDto,
  ): Promise<ForgetPasswordResponseDto> {
    return this.authService.forgetPassword(body);
  }

  // @Post('change-password')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: ChangePasswordResponseDto,
    },
    body: { type: ChangePasswordBodyDto, required: true },
    operation: {
      operationId: `changePassword`,
      summary: `Api changePassword`,
    },
  })
  @RoleBaseAccessControl(true)
  @ApiBearerAuth()
  async changePassword(
    @Body() body: ChangePasswordBodyDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.authService.changePassword(body);
  }

  @Post('refresh-token')
  @SwaggerApiDocument({
    response: {
      status: HttpStatus.OK,
      type: RefreshTokenResponseDto,
    },
    operation: {
      operationId: `refreshToken`,
      summary: `Api refreshToken`,
    },
  })
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  async refreshToken(
    @User() userPayload: UserJwtPayload,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(userPayload);
  }
}
