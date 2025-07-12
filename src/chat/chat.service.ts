import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import ChatProvider from './provider/chat.provider';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly provider: ChatProvider) {}

  findAll(user: User, options: IPaginationOptions, nome: string) {
    return this.provider.findAll(user, options, nome)
  }

  findOne(id: string, user: User) {
    return this.provider.findOne(id, user)
  }

  remove(id: string) {
    return `This action removes a #${id} chat`;
  }

  markFav(uuid: string, user: User) {
    return this.provider.markFav(uuid, user)
  }
}
