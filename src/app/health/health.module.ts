import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule.forRoot({
      // logger: null,
      // gracefulShutdownTimeoutMs: 1000,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
