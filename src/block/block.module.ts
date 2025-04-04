import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { PrismaService } from 'src/prisma.service';
import { BlockProvider } from './provider/block.provider';
import { BlockClass } from './provider/userClass/block.useClass';

@Module({
  controllers: [BlockController],
  providers: [
    BlockService,
    PrismaService,
    {
      provide: BlockProvider,
      useClass: BlockClass
    }
  ],
})
export class BlockModule { }
