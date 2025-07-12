import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma.service";
import UsuarioClass from "./provider/userClass/user.useClass";
import { UserService } from "./user.service";
import { UserProvider } from "./provider/user.provider";

@Module({
    controllers: [UserController],
    providers: [
        UserService,
        PrismaService,
        {
            provide: UserProvider,
            useClass: UsuarioClass
        }
    ],
    exports: [UserService]
})
export class UsuarioModule { }
