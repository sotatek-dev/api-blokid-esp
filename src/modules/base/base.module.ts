import { Global, Module } from '@nestjs/common';
import { DatabaseModule, DatabaseService } from './database';
import { EmailModule, EmailService } from './email';
import { HttpModule } from './http';

@Global()
@Module({
  imports: [DatabaseModule, EmailModule, HttpModule],
  providers: [DatabaseService, EmailService],
  exports: [DatabaseService, EmailService],
})
export class BaseModule {}
