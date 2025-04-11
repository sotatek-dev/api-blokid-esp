import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/base/database';

@Injectable()
export class TargetService {
  constructor(private readonly databaseService: DatabaseService) {}
}
