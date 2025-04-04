import { Autenticacao, Localizacao, Usuario } from "@prisma/client";

export interface UsuarioEntity extends Usuario {
    autenticacao: Autenticacao;
    localizacao?: Localizacao
}
