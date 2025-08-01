import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ImageProfile, Prisma, User } from '@prisma/client';
import { ChatGateway } from 'src/gateway/chat.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGetawy: ChatGateway

  ) { }

  async create(file: Express.Multer.File, user: User, slot: number) {
    const data = {
      src: file.buffer,
      userUuid: user.uuid,
      slot
    }

    const select = {
      src: false,
      uuid: true,
      slot: true
    }

    let image: any = null

    const pickImg = await this.prisma.imageProfile.findFirst({
      where: {
        slot,
        userUuid: user.uuid
      }
    })

    if (pickImg == null) {
      image = await this.prisma.imageProfile.create({
        data: {
          uuid: uuidv4(),
          ...data
        },
        select
      })
    }else {
      image = await this.prisma.imageProfile.update({
        data: {
          uuid: pickImg.uuid,
          ...data,
          slot: pickImg.slot,
          
        },
        where: {
          uuid: pickImg.uuid
        },
        select
      })
    }
    return image;
  }

  async onModuleInit() {
    console.log('Inicializando middleware do Prisma para Image Profile...');
    this.observerImages();
  }

  async observerImages() {
    this.prisma.$use(async (params, next) => {
      const result = await next(params);

      if (params.model === 'ImageProfile' && (params.action === 'update' || params.action === 'create' || params.action === 'delete')) {
        const userUuid = result?.userUuid || params.args.data?.user?.connect?.uuid || params.args.data?.userUuid;
        if (userUuid) {
          this.chatGetawy.notifyContactsOfImageProfileUpdate(params.args.where?.uuid, userUuid, params.action,  params.args.data);
        }
      }
      return result;
    })
  }

  findAll() {
    return `This action returns all imageProfile`;
  }

  async findOne(uuid: string, select: any = {}): Promise<ImageProfile> {
    const finalSelect = Object.keys(select).length === 0
      ? { uuid: true, src: true, userUuid: true, user: true }
      : select;

    try {
      console.log(uuid)
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
