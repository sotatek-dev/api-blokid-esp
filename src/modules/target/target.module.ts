import { Module } from '@nestjs/common';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [],
  controllers: [TargetController],
  providers: [TargetService],
  exports: [TargetService],
})
export class TargetModule {}
