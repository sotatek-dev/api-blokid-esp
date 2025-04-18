import { Module } from '@nestjs/common';
import { PeopleDataLabService } from './peopledatalab.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PeopleDataLabService],
  exports: [PeopleDataLabService],
})
export class PeopleDataLabModule {}
