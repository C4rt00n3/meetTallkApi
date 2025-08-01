import { CreateMessageDto } from "../dto/create-message.dto";
import { Chat, Message, User } from "@prisma/client";
import { UpdateMessageDto } from "../dto/update-message.dto";

export abstract class MessageProvider {
    abstract create(createMensageDto: CreateMessageDto, user: User, file?: Express.Multer.File | null): Promise<Message | null>;

    abstract update(id: string, updateMessageDto: UpdateMessageDto, user: User): Promise<Message | null>;

    abstract findOne(uuid: string, user: User): Promise<Message | null>;

    abstract findAll(user: User): Promise<Chat[]>;

    abstract delete(ids: string[], user: User, query: { safe: boolean }): Promise<void>;

    abstract markRead(uuid: string, user: User): Promise<void>

    abstract messageNotRead(user: User): Promise<Message[]>

    abstract listMessagUpdated(user: User): Promise<Array<Message>>
    
    abstract getImageMessage(uuid: string, chat_uuid: string, user: User): any
}