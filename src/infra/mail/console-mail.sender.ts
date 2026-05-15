import { Injectable, Logger } from '@nestjs/common';
import { MailSender, SendMailInput } from 'src/domain/services/mail-sender';

/**
 * MailSender que apenas loga no console. Útil para desenvolvimento.
 * Substituir por SendGridMailSender em produção.
 */
@Injectable()
export class ConsoleMailSender extends MailSender {
  readonly providerName = 'console';
  private readonly logger = new Logger(ConsoleMailSender.name);

  async send(input: SendMailInput): Promise<void> {
    this.logger.log(
      `[Mail] template="${input.template}" to=${input.to}\n${JSON.stringify(input.data, null, 2)}`,
    );
  }
}
