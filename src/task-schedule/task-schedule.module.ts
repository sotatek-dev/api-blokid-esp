import { Module } from '@nestjs/common';
import { TaskManagerController } from 'src/task-schedule/manager/task-manager.controller';
import { TaskManagerService } from './manager/task-manager.service';
import { TaskScheduleService } from './task-schedule.service';

@Module({
  imports: [],
  controllers: [TaskManagerController],
  providers: [TaskScheduleService, TaskManagerService],
  exports: [],
})
export class TaskScheduleModule {}
