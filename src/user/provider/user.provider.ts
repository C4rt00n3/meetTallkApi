import { User } from "@prisma/client";
import { CreateUserDto, FindUserParams, GenericFilter, UpdateUserDto } from "../dto/user.dto";
import { UserEntity } from "../entities/user.entity";

export abstract class UserProvider {
    abstract find (params: FindUserParams): Promise<User | null>

    abstract findUnique(uuid: string): Promise<User | null>

    abstract findUnique(uuid: string): Promise<User | null>

    abstract findMany(params: FindUserParams, user: User, filter: GenericFilter): Promise<User[]>

    abstract create(body: CreateUserDto): Promise<User>

    abstract update(data: UpdateUserDto, uuid: string): Promise<User | null>

    abstract delete(uuid: string): Promise<void>

    abstract findByEmail(email: string):Promise<UserEntity | null>

    abstract randomUser(user: User): Promise<User | null>
}