import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from 'src/user/user.module'; // Assumindo que este módulo exporta o UserService
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsuarioModule,
    JwtModule.register({
      global: true, // Torna o JwtService disponível globalmente
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    ConfigService,
  ],
  controllers: [AuthController],
})
export class AuthModule { }
