import { Injectable } from '@nestjs/common';
import { CreateMensageDto } from './dto/create-mensage.dto';
import { UpdateMensageDto } from './dto/update-mensage.dto';
import { Usuario } from '@prisma/client';
import { MenssageProvider } from './provider/mensage.provider';

@Injectable()
export class MensageService {
  constructor(private readonly provider: MenssageProvider) {}

  create(createMensageDto: CreateMensageDto, user: Usuario) {
    return this.provider.create(createMensageDto, user)
  }

  findAll(user: Usuario) {
    return this.provider.findAll(user)
  }

  findOne(id: string, user: Usuario) {
    return this.provider.findOne(id, user)
  }

  update(id: string, updateMensageDto: UpdateMensageDto, user: Usuario) {
    return this.provider.update(id, updateMensageDto, user)
  }

  remove(id: string, user: Usuario) {
    return this.provider.delete(id, user)
  }
}
