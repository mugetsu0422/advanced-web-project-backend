import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MailingService } from '../mailing/mailing.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity/users.entity'
import { PasswordResetToken } from 'src/entity/password-reset-token.entity'
import { EmailActivationCode } from 'src/entity/email-activation-codes.entity'
import { NotificationsService } from 'src/notifications/notifications.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([PasswordResetToken]),
    TypeOrmModule.forFeature([EmailActivationCode]),
  ],
  providers: [UsersService, MailingService, NotificationsService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
