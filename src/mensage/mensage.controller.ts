import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MensageService } from './mensage.service';
import { CreateMensageDto } from './dto/create-mensage.dto';
import { UpdateMensageDto } from './dto/update-mensage.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Usuario } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('mensage')
export class MensageController {
  constructor(private readonly mensageService: MensageService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createMensageDto: CreateMensageDto, @GetUser() user: Usuario) {
    return this.mensageService.create(createMensageDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: Usuario) {
    return this.mensageService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.mensageService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateMensageDto: UpdateMensageDto, @GetUser() user: Usuario) {
    return this.mensageService.update(id, updateMensageDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.mensageService.remove(id, user);
  }
}
