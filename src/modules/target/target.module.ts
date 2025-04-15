import { Module } from '@nestjs/common';
import { EnrichmentModule } from 'src/integrated/enrichment';
import {
  TargetCompanyController,
  TargetCompanyService,
} from 'src/modules/target/company';
import { TargetPersonController, TargetPersonService } from './person';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [EnrichmentModule],
  controllers: [TargetController, TargetPersonController, TargetCompanyController],
  providers: [TargetService, TargetPersonService, TargetCompanyService],
  exports: [],
})
export class TargetModule {}
