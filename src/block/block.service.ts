import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BlockProvider } from './provider/block.provider';

@Injectable()
export class BlockService {
  constructor(private readonly provider: BlockProvider) {}
   
  create(userId: string, user: User) {
    return this.provider.create(userId, user);
  }

  findAll(user: User, page: number, size: number) {
    return this.provider.findAll(user, page, size)
  }

  findOne(id: string, user: User) {
    return this.provider.findOne(id, user)
  }

  remove(userId: string, user: User) {
    return this.provider.remove(userId, user);
  }
}
