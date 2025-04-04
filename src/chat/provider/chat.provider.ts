import { Chat, Usuario } from "@prisma/client";
import { IPaginationOptions } from "nestjs-typeorm-paginate";

export default abstract class ChatProvider {
    abstract findAll(user: Usuario, options: IPaginationOptions, nome: string): Promise<Chat[]>

    abstract findOne(uuid: string, user: Usuario): Promise<Chat | null>

    abstract remove(uuid: string, user: Usuario): Promise<void>
}