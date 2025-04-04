import { Module } from "@nestjs/common";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { PrismaService } from "src/prisma.service";
import { UsuarioProvider } from "./provider/usuario.provider"; // Corrigido
import UsuarioClass from "./provider/userClass/usuario.useClass";

@Module({
    controllers: [UsuarioController],
    providers: [
        UsuarioService,
        PrismaService,
        {
            provide: UsuarioProvider,
            useClass: UsuarioClass
        }
    ],
    exports: [UsuarioService]
})
export class UsuarioModule { }
