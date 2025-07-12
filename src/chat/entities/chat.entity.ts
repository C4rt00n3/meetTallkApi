import { User } from "@prisma/client";
import { Mensage } from "src/message/entities/message.entity";
import { Entity } from "typeorm";

@Entity('chats')
export class ChatEntity {
    uuid: string;
    createdAt: Date;
    lastMessageDate?: Date;
    messages: Mensage[];
    participants: {
        chatId: string;
        userId: string;
        user: User
    }[]
}
