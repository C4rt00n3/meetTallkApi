import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MensageClass } from './provider/useClass/message.provider';
import { MessageProvider } from './provider/message.provider';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    PrismaService,
    ChatGateway,
    {
      provide: MessageProvider,
      useClass: MensageClass
    }
  ],
  exports: [MessageService, ChatGateway]
})
export class MensageModule { }
