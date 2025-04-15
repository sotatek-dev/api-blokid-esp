import { Module } from '@nestjs/common';
import { TargetCompanyController } from './target-company.controller';
import { TargetCompanyService } from './target-company.service';

@Module({
  imports: [],
  controllers: [TargetCompanyController],
  providers: [TargetCompanyService],
  exports: [TargetCompanyService],
})
export class TargetCompanyModule {}
