import { Module } from '@nestjs/common';
import { FootprintController } from './footprint.controller';
import { FootprintService } from './footprint.service';

@Module({
  imports: [],
  controllers: [FootprintController],
  providers: [FootprintService],
  exports: [FootprintService],
})
export class FootprintModule {}
