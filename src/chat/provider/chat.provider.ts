import { Chat, User } from "@prisma/client";
import { IPaginationOptions } from "nestjs-typeorm-paginate";

export default abstract class ChatProvider {
    abstract findAll(user: User, options: IPaginationOptions, nome: string): Promise<Chat[]>

    abstract findOne(uuid: string, user: User): Promise<Chat>

    abstract remove(uuid: string, user: User): Promise<void>

    abstract markFav(uuid: string, user: User): Promise<User>
}