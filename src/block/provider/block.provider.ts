import { Block, User } from "@prisma/client";

export abstract class BlockProvider {
    abstract create(userId: string, user: User): Promise<Block | null>;

    abstract findAll(user: User, page: number, size: number): Promise<Block[]>;

    abstract findOne(id: string, user: User): Promise<Block | null>;

    abstract remove(userId: string, user: User): Promise<void>;
}