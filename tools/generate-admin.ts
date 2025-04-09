import { Module } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { isEmail } from 'class-validator';
import { Command, CommandFactory, CommandRunner, Option } from 'nest-commander';
import { ERROR_RESPONSE } from 'src/common/const';
import { SYSTEM_REGEXS } from 'src/common/const/regex';
import { getCurrentDate } from 'src/common/helpers/time';
import { ServerConfig } from 'src/core/config';
import { ValidationError } from 'src/core/errors';
import { bcrypt } from 'src/core/libs/bcrypt';
import { ServerLogger } from 'src/core/logger';
import { ServerException } from 'src/exceptions';
import { DatabaseModule, DatabaseService } from 'src/modules/base/database';

@Module({
  imports: [DatabaseModule],
  providers: [DatabaseService],
})
@Command({ name: 'gen-admin', description: 'Create a new user' })
export class GenerateAdmin extends CommandRunner {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async run(_param: string[], options?: Record<string, any>): Promise<void> {
    const { email, password } = options;

    const isUserExist = await this.databaseService.user.findFirst({
      where: { email },
    });
    if (isUserExist) {
      throw new ServerException(ERROR_RESPONSE.USER_ALREADY_EXISTED);
    }

    const hashPassword = await bcrypt.hash(
      password,
      ServerConfig.get().BCRYPT_SALT_ROUNDS,
    );
    await this.databaseService.user.create({
      data: {
        email,
        role: UserRole.Admin,
        password: hashPassword,
        lastActive: getCurrentDate(),
        status: UserStatus.Active,
      },
    });
    ServerLogger.info({ message: `Admin ${email} is created`, context: `GenerateAdmin` });
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'User email',
    required: true,
  })
  parseEmail(val: string): string {
    if (!isEmail(val)) {
      throw new ValidationError(`Incorrect email`);
    }
    return val;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'User password',
    required: true,
  })
  parsePassword(val: string): string {
    if (!SYSTEM_REGEXS.USER_PASSWORD_SIMPLE.test(val)) {
      throw new ValidationError(ERROR_RESPONSE.PASSWORD_NOT_SECURE.message);
    }
    return val;
  }
}

(async function bootstrap() {
  await CommandFactory.run(GenerateAdmin);
})();
