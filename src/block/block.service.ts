import { Injectable } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { Usuario } from '@prisma/client';
import { BlockProvider } from './provider/block.provider';

@Injectable()
export class BlockService {
  constructor(private readonly provider: BlockProvider) {}
   
  create(createBlockDto: CreateBlockDto, user: Usuario) {
    return this.provider.create(createBlockDto, user);
  }

  findAll(user: Usuario) {
    return this.provider.findAll(user)
  }

  findOne(id: string, user: Usuario) {
    return this.provider.findOne(id, user)
  }

  remove(id: string, user: Usuario) {
    return this.provider.remove(id, user);
  }
}
