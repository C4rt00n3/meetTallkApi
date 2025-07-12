import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { GetUser } from './get-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CreateLoginDto } from './dto/created.login';

@ApiTags("Login")
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
}