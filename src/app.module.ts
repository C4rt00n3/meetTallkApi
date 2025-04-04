import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioController } from './usuario/usuario.controller';
import { UsuarioService } from './usuario/usuario.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ChatModule } from './chat/chat.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { MensageModule } from './mensage/mensage.module';
import { BlockModule } from './block/block.module';

@Module({
  imports: [UsuarioModule, ChatModule, AuthModule, MensageModule, BlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
