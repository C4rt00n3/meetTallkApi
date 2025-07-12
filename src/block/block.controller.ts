import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BlockService } from './block.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) { }

  @Post(":user_id")
  @UseGuards(AuthGuard)
  create(@Param("user_id") userId: string, @GetUser() user: User) {
    return this.blockService.create(userId, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @GetUser() user: User,
    @Query("page") page?: number,
    @Query("size") size?: number,
  ) {
    return this.blockService.findAll(user, page || 1, size || 20);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.blockService.findOne(id, user);
  }

  @Delete(':user_id')
  @UseGuards(AuthGuard)
  remove(@Param('user_id') userId: string, @GetUser() user: User) {
    return this.blockService.remove(userId, user);
  }
}
