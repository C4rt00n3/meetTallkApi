import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CraeteLogin } from './dto/created.login';
import { AuthGuard } from './auth.guard';
import { GetUser } from './get-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Usuario } from '@prisma/client';

@ApiTags("Login")
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: CraeteLogin) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('authentication')
  @UseGuards(AuthGuard)
  async validateToken(@GetUser() user: Usuario) {
    return user;
  }
}