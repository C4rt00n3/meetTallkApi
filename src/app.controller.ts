import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { GetUser } from './auth/get-user.decorator';
import { UserEntity } from './user/entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("verifyToken")
  @UseGuards(AuthGuard)
  verifyToken(@GetUser() user: UserEntity) {
    
  }
}
