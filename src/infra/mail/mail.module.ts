import { Module } from '@nestjs/common';
import { MailSender } from 'src/domain/services/mail-sender';
import { ConsoleMailSender } from './console-mail.sender';

@Module({
  providers: [{ provide: MailSender, useClass: ConsoleMailSender }],
  exports: [MailSender],
})
export class MailModule {}
