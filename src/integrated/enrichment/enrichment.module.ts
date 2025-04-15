import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EnrichmentService],
  exports: [EnrichmentService],
})
export class EnrichmentModule {}
