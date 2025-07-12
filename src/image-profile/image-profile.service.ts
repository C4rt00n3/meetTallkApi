import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateImageProfileDto } from './dto/update-image-profile.dto';
import { PrismaService } from 'src/prisma.service';
import { ImageProfile, Prisma, User } from '@prisma/client';
import { count } from 'console';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Injectable()
export class ImageProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(file: Express.Multer.File, user: User) {
    const cont = await this.prisma.imageProfile.count({
      where: {
        userUuid: user.uuid,
      }
    })

    if (cont >= 5)
      throw new UnauthorizedException("Limite de 5 fotos de perfil")

    const primary = await this.prisma.imageProfile.count({
      where: {
        userUuid: user.uuid,
        isPrimary: true
      }
    })

    let isPrimary = false

    if (primary == 0) {
      isPrimary = true
    }

    const data = {
      src: file.buffer,
      userUuid: user.uuid,
      isPrimary
    }

    const image = await this.prisma.imageProfile.create({
      data, select: {
        src: false,
        uuid: true
      }
    })

    return image;
  }

  findAll() {
    return `This action returns all imageProfile`;
  }
 
  async findOne(uuid: string, select: any = {}): Promise<ImageProfile> {
    const finalSelect = Object.keys(select).length === 0
      ? { uuid: true, src: true, userUuid: true, user: true }
      : select;

    try {
      return await this.prisma.imageProfile.findUniqueOrThrow({
        where: { uuid },
        select: finalSelect,
      }) as unknown as ImageProfile;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Image profile with uuid ${uuid} not found.`);
      }

      throw error; // rethrow unexpected errors
    }
  }

  async update(uuid: string, file: Express.Multer.File, user: User) {
    const image = await this.findOne(uuid, { uuid: true, userUuid: true })
    if (user.uuid != image.userUuid)
      throw new UnauthorizedException("Sem autorização!")
    const imageUIID = await this.prisma.imageProfile.update({
      where: {
        uuid
      },
      data: {
        src: file.buffer
      },
      select: {
        uuid: true,
        userUuid: true,
      }
    })
    return imageUIID
  }

  async remove(uuid: string, user: User) {
    const image = await this.findOne(uuid, { uuid: true, userUuid: true })
    if (user.uuid != image.userUuid)
      throw new UnauthorizedException()

    this.prisma.imageProfile.delete({
      where: {
        uuid
      }
    })
  }
}
