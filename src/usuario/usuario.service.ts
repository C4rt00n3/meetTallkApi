import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUsariosParams, UpdateUsuarioDto, UsuarioDto } from './dto/usuario.dto';
import { UsuarioProvider } from './provider/usuario.provider';
import { Usuario } from '@prisma/client';
import { UsuarioEntity } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
    constructor(private readonly provider: UsuarioProvider) { }

    find = (uuid: string) => this.provider.findUnique(uuid)

    findMany = (params: FindUsariosParams, user: UsuarioEntity) => this.provider.findMany(params, user)

    create = (body: UsuarioDto) => this.provider.create(body)

    updadte = (data: UpdateUsuarioDto, uuid: string) => this.provider.update(data, uuid)

    delete = (uuid: string) => this.provider.delete(uuid)

    findByEmail = (email: string) => this.provider.findByEmail(email)
}