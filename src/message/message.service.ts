import { Injectable } from '@nestjs/common';
import { Message, User } from '@prisma/client';
import { MessageProvider } from './provider/message.provider';
import { CreateMessageDto, DeleteMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly provider: MessageProvider) {}

  create(
    createMensageDto: CreateMessageDto, 
    user: User,
    file?: Express.Multer.File | null,
  ) {
    return this.provider.create(createMensageDto, user, file)
  }

  findAll(user: User) {
    return this.provider.findAll(user)
  }

  findOne(id: string, user: User) {
    return this.provider.findOne(id, user)
  }

  update(id: string, updateMensageDto: UpdateMessageDto, user: User) {
    return this.provider.update(id, updateMensageDto, user)
  }

  delete({ ids }: DeleteMessageDto, user: User, query: {safe: boolean}) {
    return this.provider.delete(ids, user, query)
  }

  markRead(uuid: string, user: User) {
    return this.provider.markRead(uuid, user)
  }

  messageNotRead(user: User) {
    return this.provider.messageNotRead(user)
  }

  async listMessagUpdated(user: User):  Promise<Array<Message>> {
    return await this.provider.listMessagUpdated(user)
  }

  getImageMessage(uuid: string, chat_uuid: string, user: User) {
    return this.provider.getImageMessage(uuid, chat_uuid, user)
  }
}
