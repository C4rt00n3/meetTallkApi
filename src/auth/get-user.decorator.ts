import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IGetUser } from 'src/cammons/interfaces/get-user';
import { PrismaService } from 'src/prisma.service';

export const GetUser = createParamDecorator(async (data: unknown, ctx: ExecutionContext): Promise<IGetUser> => {
    const prismaService = new PrismaService();
    const request = ctx.switchToHttp().getRequest();
    return await prismaService.user.findUniqueOrThrow({
        where: {
            uuid: request.user.sub
        },
        include: {
            location: true,
            preference: true
        }
    }).then(e => e).catch(_ => { throw new UnauthorizedException() })
});