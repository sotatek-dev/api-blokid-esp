import * as compression from 'compression';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  public static configure(opts: compression.CompressionOptions) {
    this.options = opts;
  }

  private static options: compression.CompressionOptions;

  public use(req: any, res: any, next: any) {
    if (CompressionMiddleware.options) {
      compression(CompressionMiddleware.options)(req, res, next);
    } else {
      compression()(req, res, next);
    }
  }
}
