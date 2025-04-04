import { Usuario, Block } from "@prisma/client";
import { CreateBlockDto } from "src/block/dto/create-block.dto";
import { BlockProvider } from "../block.provider";
import { PrismaService } from "src/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class BlockClass implements BlockProvider {
    constructor(private readonly prisma: PrismaService) { }

    async create({ blockedUserId }: CreateBlockDto, user: Usuario): Promise<Block | null> {
        return await this.prisma.block.create({
            data: {
                blockedUserId,
                usuarioUuid: user.uuid
            }
        })
    }

    async findAll({ uuid }: Usuario): Promise<Block[]> {
        return await this.prisma.block.findMany({
            where: {
                usuarioUuid: uuid
            }
        });
    }

    async findOne(uuid: string, user: Usuario): Promise<Block | null> {
        return await this.prisma.block.findUniqueOrThrow({
            where: {
                uuid,
                usuarioUuid: user.uuid
            }
        }).then(e => e).catch(error => {
            console.log(error)
            throw new NotFoundException("Não encontrado")
        });
    }

    async remove(uuid: string, user: Usuario): Promise<void> {
        await this.prisma.block.delete({
            where: {
                uuid,
                usuarioUuid: user.uuid
            }
        });
    }
}