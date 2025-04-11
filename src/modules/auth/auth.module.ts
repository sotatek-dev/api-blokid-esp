import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServerConfig } from 'server-config/index';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ServerConfig.get().JWT_SECRET,
    }),
  ],
  providers: [AuthService, RefreshTokenStrategy, AuthStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
