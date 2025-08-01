import { Module } from '@nestjs/common';
import { ImageProfileService } from './image-profile.service';
import { ImageProfileController } from './image-profile.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Module({
  controllers: [ImageProfileController],
  providers: [ImageProfileService, PrismaService, ChatGateway],
  exports: [ImageProfileService]
})
export class ImageProfileModule {}
