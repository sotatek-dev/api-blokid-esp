import { Module } from '@nestjs/common';
import { PeopleDataLabModule } from 'src/integrations/peopledatalab';
import {
  ExecutiveUploadController,
  ExecutiveUploadService,
} from 'src/modules/executive/upload';
import { ExecutiveCompanyController, ExecutiveCompanyService } from './company';
import { ExecutivePersonController, ExecutivePersonService } from './person';

@Module({
  imports: [PeopleDataLabModule],
  controllers: [
    ExecutivePersonController,
    ExecutiveCompanyController,
    ExecutiveUploadController,
  ],
  providers: [ExecutivePersonService, ExecutiveCompanyService, ExecutiveUploadService],
  exports: [],
})
export class ExecutiveModule {}
