import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { Usuario } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @GetUser() user: Usuario,
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
  findOne(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.chatService.findOne(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
