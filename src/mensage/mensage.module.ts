import { Module } from '@nestjs/common';
import { MensageService } from './mensage.service';
import { MensageController } from './mensage.controller';
import { PrismaService } from 'src/prisma.service';
import { MensageClass } from './provider/useClass/menssage.provider';
import { MenssageProvider } from './provider/mensage.provider';

@Module({
  controllers: [MensageController],
  providers: [
    MensageService,
    PrismaService,
    {
      provide: MenssageProvider,
      useClass: MensageClass
    }
  ],
})
export class MensageModule { }
