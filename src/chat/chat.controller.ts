import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @GetUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
    @Query("nome") nome: string
  ) {
    const options: IPaginationOptions = { page, limit };
    return this.chatService.findAll(
      user,
      options,
      nome
    );
  }
  
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.chatService.findOne(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }

  @Patch(":uuid")
  @UseGuards(AuthGuard)
  markFav(@Param('uuid') uuid: string, @GetUser() user: User) {
    return this.chatService.markFav(uuid, user)
  }
}
