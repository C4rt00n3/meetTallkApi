import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Usuario } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createBlockDto: CreateBlockDto,@GetUser() user: Usuario) {
    return this.blockService.create(createBlockDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: Usuario) {
    return this.blockService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.blockService.findOne(id, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.blockService.remove(id, user);
  }
}
