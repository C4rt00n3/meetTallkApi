import { BlockProvider } from "../block.provider";
import { PrismaService } from "src/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Block, User } from "@prisma/client";

@Injectable()
export class BlockClass implements BlockProvider {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, user: User): Promise<Block | null> {
        return await this.prisma.block.create({
            data: {
                blockedUserId: userId,
                userId: user.uuid
            }
        })
    }

    async findAll({ uuid }: User): Promise<Block[]> {
        return await this.prisma.block.findMany({
            where: {
                userId: uuid
            },
            include: {
                blockedUser: true
            }
        });
    }

    async findOne(uuid: string, user: User): Promise<Block | null> {
        return await this.prisma.block.findUniqueOrThrow({
            where: {
                uuid,
                userId: user.uuid
            }
        }).then(e => e).catch(error => {
            console.log(error)
            throw new NotFoundException("Não encontrado")
        });
    }

    async remove(userId: string, user: User): Promise<void> {
        const block = await this.prisma.block.findFirst({
            where: {
                blockedUserId: userId,
                userId: user.uuid
            }
        });

        if (block == null)
            throw new NotFoundException("Não encontrado!");

        const { uuid } = block;

        await this.prisma.block.delete({
            where: {
                uuid
            }
        });
    }
}