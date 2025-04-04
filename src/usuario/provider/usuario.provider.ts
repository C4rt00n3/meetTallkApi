import { UsuarioEntity } from "../entities/usuario.entity";
import { FindUsariosParams, UpdateUsuarioDto, UsuarioDto } from "../dto/usuario.dto";
import { Usuario } from "@prisma/client";

export abstract class UsuarioProvider {
    abstract find (params: FindUsariosParams): Promise<Usuario | null>

    abstract findUnique(uuid: string): Promise<Usuario | null>

    abstract findUnique(uuid: string): Promise<Usuario | null>

    abstract findMany(params: FindUsariosParams, user: UsuarioEntity): Promise<Usuario[]>

    abstract create(body: UsuarioDto): Promise<Usuario>

    abstract update(data: UpdateUsuarioDto, uuid: string): Promise<Usuario | null>

    abstract delete(uuid: string): Promise<void>

    abstract findByEmail(email: string):Promise<UsuarioEntity | null>
}