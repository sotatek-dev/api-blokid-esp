import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ServerConfig } from 'src/core/config';
import { path } from 'src/core/libs/file-system-manipulate';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
          user: ServerConfig.get().SMTP_GMAIL_USER,
          pass: ServerConfig.get().SMTP_GMAIL_PASS,
        },
      },
      defaults: {
        replyTo: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: path.join(__dirname, '../../../..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
      preview: false,
    }),
  ],
  providers: [EmailService],
})
export class EmailModule {}
