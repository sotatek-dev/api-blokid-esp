import { ValidationPipe } from '@nestjs/common';
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe';
import { ERROR_RESPONSE } from 'src/common/const';
import { _ } from 'src/core/libs/lodash';
import { ServerException } from 'src/exceptions/server.exception';

interface PayloadValidationPipeOptions extends ValidationPipeOptions {
  protocol: 'http' | 'websocket';
}

/**
 * A custom validation pipe that extends the NestJS ValidationPipe.
 * This pipe transforms and validates incoming request payloads.
 * If validation fails, it throws a <b>ServerException</b> by default with detailed error information.<br>
 * You can also you options.protocol === websocket to throw <b>WebsocketException</b>
 *
 **/
class PayloadValidationPipe extends ValidationPipe {
  constructor(options?: PayloadValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const details = {};
        errors.forEach((e) => _.assign(details, e.constraints));
        const exceptionResponse = {
          ...ERROR_RESPONSE.REQUEST_PAYLOAD_VALIDATE_ERROR,
          message: `REQUEST_PAYLOAD_VALIDATE_ERROR: ${errors.map((e) => e.property).join(', ')}`,
          details,
        };
        return new ServerException(exceptionResponse);
      },
      ...options,
    });
  }
}

export { PayloadValidationPipe };
