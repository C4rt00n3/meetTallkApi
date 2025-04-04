import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Usuario } from '@prisma/client';
import ChatProvider from './provider/chat.provider';

@Injectable()
export class ChatService {
  constructor(private readonly provider: ChatProvider) {}

  findAll(user: Usuario, options: IPaginationOptions, nome: string) {
    return this.provider.findAll(user, options, nome)
  }

  findOne(id: string, user: Usuario) {
    return this.provider.findOne(id, user)
  }

  remove(id: string) {
    return `This action removes a #${id} chat`;
  }
}
