import { Module } from '@nestjs/common';
import {
  ExecutiveUploadController,
  ExecutiveUploadService,
} from 'src/modules/executive/upload';
import { ExecutiveCompanyController, ExecutiveCompanyService } from './company';
import { ExecutivePersonController, ExecutivePersonService } from './person';

@Module({
  imports: [],
  controllers: [
    ExecutivePersonController,
    ExecutiveCompanyController,
    ExecutiveUploadController,
  ],
  providers: [ExecutivePersonService, ExecutiveCompanyService, ExecutiveUploadService],
  exports: [],
})
export class ExecutiveModule {}
