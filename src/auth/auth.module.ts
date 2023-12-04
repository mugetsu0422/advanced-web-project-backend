import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { FacebookStrategy } from './strategies/facebook.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('secret'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
