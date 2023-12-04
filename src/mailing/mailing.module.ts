import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailingController } from './mailing.controller'
import { MailingService } from './mailing.service'

@Module({
  providers: [MailingService, ConfigService],
  controllers: [MailingController],
})
export class MailingModule {}
