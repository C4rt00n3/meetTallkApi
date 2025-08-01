import { Injectable } from '@nestjs/common';
import { CreateUserDto, FindUserParams, GenericFilter, UpdateUserDto } from './dto/user.dto';
import { UserProvider } from './provider/user.provider';
import { User } from '@prisma/client';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(private readonly provider: UserProvider) { }

    find = (uuid: string) => this.provider.findUnique(uuid)

    findMany = (params: FindUserParams, user: User, filter: GenericFilter) => this.provider.findMany(params, user, filter)

    create = (body: CreateUserDto) => this.provider.create(body)

    updadte = (data: UpdateUserDto, uuid: string) => this.provider.update(data, uuid)

    delete = (uuid: string) => this.provider.delete(uuid)

    findByEmail = (email: string) => this.provider.findByEmail(email)

    random = (user: UserEntity) => this.provider.randomUser(user)
}