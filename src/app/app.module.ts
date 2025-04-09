import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from 'src/app/health';
import {
  CompressionMiddleware,
  CookieParserMiddleware,
  CorrelationIdMiddleware,
  HelmetMiddleware,
  HttpLoggerMiddleware,
} from 'src/middlewares';
import { AuthModule } from 'src/modules/auth';
import { BaseModule } from 'src/modules/base';
import { UserModule } from 'src/modules/user';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskScheduleModule } from '../task-schedule/task-schedule.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    DiscoveryModule,
    BaseModule,
    AuthModule,
    HealthModule,
    ScheduleModule.forRoot(),
    TaskScheduleModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        CorrelationIdMiddleware,
        HelmetMiddleware,
        CookieParserMiddleware,
        CompressionMiddleware,
      )
      .forRoutes('*');

    // logger
    consumer.apply(HttpLoggerMiddleware).exclude('(v[0-9]+)/auth/(.*)').forRoutes('*');

    // error-able middleware
    // consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
