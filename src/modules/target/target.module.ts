import { Module } from '@nestjs/common';
import { TargetPersonController, TargetPersonService } from './person';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [],
  controllers: [TargetController, TargetPersonController],
  providers: [TargetService, TargetPersonService],
  exports: [],
})
export class TargetModule {}
