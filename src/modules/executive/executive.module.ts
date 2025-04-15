import { Module } from '@nestjs/common';
import { ExecutiveCompanyController, ExecutiveCompanyService } from './company';
import { ExecutivePersonController, ExecutivePersonService } from './person';

@Module({
  imports: [],
  controllers: [ExecutivePersonController, ExecutiveCompanyController],
  providers: [ExecutivePersonService, ExecutiveCompanyService],
  exports: [],
})
export class ExecutiveModule {}
