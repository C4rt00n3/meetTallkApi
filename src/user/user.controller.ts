import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { HashPasswordInterceptor } from './interceptor/password.interceptor ';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, GenericFilter, UpdateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private service: UserService) { }

    @Get(":uuid")
    @UseGuards(AuthGuard)
    async find(@Param('uuid') uuid: string) {
        return await this.service.find(uuid)
    }

    @Get()
    @UseGuards(AuthGuard)
    async findMay(
        @GetUser() user: UserEntity,
        @Query() { name, ...filter }: GenericFilter
    ) {
        return await this.service.findMany({ name }, user, filter)
    }

    @Post()
    @UseInterceptors(HashPasswordInterceptor)
    async create(@Body() data: CreateUserDto) {
        return await this.service.create(data)
    }

    @UseGuards(AuthGuard)
    @Patch()
    async updadte(@Body() body: UpdateUserDto, @GetUser() { uuid }: User) {
        return await this.service.updadte(body, uuid)
    }

    @Delete()
    @UseGuards(AuthGuard)
    async delete(@GetUser() user: User) {
        return await this.service.delete(user.uuid)
    }

    @Get("random/get")
    @UseGuards(AuthGuard)
    async random(@GetUser() user: UserEntity) {
        return await this.service.random(user)
    }
}
