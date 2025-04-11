import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { ServerConfig } from 'server-config/index';
import { ERROR_RESPONSE } from 'src/common/const';
import { ServerException } from 'src/exceptions';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const { HTTP_REQUEST_TIMEOUT } = ServerConfig.get();
    if (ServerConfig.isLocalEnv()) {
      return next.handle();
    }
    return next.handle().pipe(
      timeout({
        each: HTTP_REQUEST_TIMEOUT,
        with: () => {
          throw new ServerException(ERROR_RESPONSE.REQUEST_TIMEOUT);
        },
      }),
    );
  }
}
