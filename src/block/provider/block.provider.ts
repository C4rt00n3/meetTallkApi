import { Block, Usuario } from "@prisma/client";
import { CreateBlockDto } from "../dto/create-block.dto";

export abstract class BlockProvider {
    abstract create(createBlockDto: CreateBlockDto, user: Usuario): Promise<Block | null>;

    abstract findAll(user: Usuario): Promise<Block[]>;

    abstract findOne(id: string, user: Usuario): Promise<Block | null>;

    abstract remove( id: string, user: Usuario): Promise<void>;
}