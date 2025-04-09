import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { AccessRole } from 'src/common/enums';
import { convertErrorToObject } from 'src/common/helpers/error';
import { AsyncStorage } from 'src/core/async-storage';
import { SRequest } from 'src/core/platform';
import { RBAC_METADATA_KEY } from 'src/decorators';
import { ServerException } from 'src/exceptions';

/**
 * @workflow PassportAuthGuard with jwt veryfication
 *
 * 1. AuthGuard.canActivate() -> super.canActivate()
 * 2. JwtStrategy.validate()
 * 3. AuthGuard.handleRequest()
 */
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const apiRoles = this.reflector.getAllAndOverride<AccessRole[]>(RBAC_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (apiRoles.includes(AccessRole.Public)) {
      return true;
    }
    // trigger strategy
    const isValidToken = await super.canActivate(context);
    if (!isValidToken) {
      throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);
    }

    const request: SRequest = this.getRequest(context);
    const userRole = request.user.role as AccessRole;
    const userId = request.user.id;

    if (!apiRoles.includes(userRole)) {
      throw new ServerException({
        ...ERROR_RESPONSE.FORBIDDEN_RESOURCE,
        message: 'Role access denied',
        details: { userRole, apiRoles },
      });
    }

    AsyncStorage.setUserId(userId);
    AsyncStorage.setUserRole(userRole as UserRole);

    return true;
  }

  /**
   * @brief Custom error when super.canActivate(context) || JwtStrategy.validate fail
   *
   * @param err error threw from JwtStrategy.validate
   * @param user payload returned from JwtStrategy.validate (UserJwtPayload)
   * @param info error info when jwt verify fail
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new ServerException({
        ...ERROR_RESPONSE.UNAUTHORIZED,
        message: info?.message,
        details: convertErrorToObject(info),
      });
    }
    return user;
  }
}
