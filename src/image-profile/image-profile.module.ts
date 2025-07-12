import { Module } from '@nestjs/common';
import { ImageProfileService } from './image-profile.service';
import { ImageProfileController } from './image-profile.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ImageProfileController],
  providers: [ImageProfileService, PrismaService],
})
export class ImageProfileModule {}
