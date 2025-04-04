import { Provider } from "@nestjs/common";
import { CreateMensageDto } from "../dto/create-mensage.dto";
import { UpdateMensageDto } from "../dto/update-mensage.dto";
import { Chat, Menssagem, Usuario } from "@prisma/client";

export abstract class MenssageProvider {
    abstract create(createMensageDto: CreateMensageDto, user: Usuario): Promise<Menssagem | null>;

    abstract update(id: string, updateMensageDto: UpdateMensageDto, user: Usuario): Promise<Menssagem | null>;

    abstract findOne(uuid: string, user: Usuario): Promise<Menssagem | null>;

    abstract findAll(user: Usuario): Promise<Chat[]>;

    abstract delete(uuid: string, user: Usuario): Promise<void>
}