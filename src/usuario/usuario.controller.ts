import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateUsuarioDto, UsuarioDto } from './dto/usuario.dto';
import { UsuarioService } from './usuario.service';
import { HashPasswordInterceptor } from './interceptor/password.interceptor ';
import { AuthGuard } from 'src/auth/auth.guard';
import { Usuario } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';
import { UsuarioEntity } from './entities/usuario.entity';

@Controller('user')
export class UsuarioController {

    constructor(private service: UsuarioService) { }

    @Get(":uuid")
    @UseGuards(AuthGuard)
    async find(@Param('uuid') uuid: string) {
        return await this.service.find(uuid)
    }

    @Get()
    @UseGuards(AuthGuard)
    async findMay(@Query("nome") nome: string, @GetUser() user: UsuarioEntity) {
        return await this.service.findMany({nome}, user)
    }

    @Post()
    @UseInterceptors(HashPasswordInterceptor)
    async create(@Body() data: UsuarioDto) {
        return await this.service.create(data)
    }

    @UseGuards(AuthGuard)
    @Patch()
    async updadte(@Body() body: UpdateUsuarioDto, @GetUser() { uuid }: Usuario) {
        return await this.service.updadte(body, uuid)
    }

    @Delete()
    @UseGuards(AuthGuard)
    async delete(@GetUser() user: Usuario) {
        return await this.service.delete(user.uuid)
    }
}
