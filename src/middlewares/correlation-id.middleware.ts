import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncStorage } from 'src/core/async-storage';
import { uuidv4 } from 'src/core/libs/uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['X-Correlation-Id'] as string) || uuidv4();
    req.headers['X-Correlation-Id'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);
    AsyncStorage.setCorrelationId(correlationId);
    next();
  }
}
