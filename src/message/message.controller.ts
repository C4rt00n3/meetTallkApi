import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreateMessageDto, DeleteMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createMensageDto: CreateMessageDto, @GetUser() user: User) {
    return this.messageService.create(createMensageDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: User) {
    return this.messageService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.messageService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateMensageDto: UpdateMessageDto, @GetUser() user: User) {
    return this.messageService.update(id, updateMensageDto, user);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async remove(
    @Body() deleteDto: DeleteMessageDto,
    @GetUser() user: User,
    @Query() query: { safe: boolean }
  ): Promise<void> {
    return this.messageService.delete(deleteDto, user, query);
  }

  @Get("list/updated/")
  @UseGuards(AuthGuard)
  async listMessagesUpdated(
    @GetUser() user: User
  ) {
    return this.messageService.listMessagUpdated(user);
  }

  @Get("markRead/:chat_uuid")
  @UseGuards(AuthGuard)
  markRead(
    @Param("chat_uuid") uuid: string,
    @GetUser() user: User
  ) {
    return this.messageService.markRead(uuid, user);
  }
}

