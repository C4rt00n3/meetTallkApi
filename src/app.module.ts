import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { MensageModule } from './message/message.module';
import { BlockModule } from './block/block.module';
import { ImageProfileModule } from './image-profile/image-profile.module';

@Module({
  imports: [UsuarioModule, ChatModule, AuthModule, MensageModule, ImageProfileModule, BlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
