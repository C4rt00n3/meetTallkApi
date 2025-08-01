import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CreateLoginDto } from './dto/created.login';
import { AuthGuard } from './auth.guard';

@ApiTags("Login")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: CreateLoginDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('authentication')
  @UseGuards(AuthGuard)
  async validateToken(@GetUser() user: User) {
    return user;
  }

  @Post('google')
  @UseGuards(AuthGuard)
  async auth(@Req() req: Request) { 
    return this.authService.singInGoogle(req["user"])
  }
}