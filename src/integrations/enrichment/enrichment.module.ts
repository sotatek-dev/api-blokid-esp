import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { PeopleDataLabService } from './peopledatalab.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EnrichmentService, PeopleDataLabService],
  exports: [PeopleDataLabService, PeopleDataLabService],
})
export class EnrichmentModule {}
