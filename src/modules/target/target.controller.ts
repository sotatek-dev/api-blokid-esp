import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl } from 'src/decorators';
import { AuthGuard } from 'src/guards';

@Controller('target')
@ApiTags('Target')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class TargetController {}
