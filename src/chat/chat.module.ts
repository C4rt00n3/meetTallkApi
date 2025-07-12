import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import ChatProvider from './provider/chat.provider';
import { ChatClass } from './provider/useClass/chat.useClass';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    PrismaService,
    {
      provide: ChatProvider,
      useClass: ChatClass
    }
  ],
  exports: [ChatService]
})
export class ChatModule { }
