import { Usuario } from "@prisma/client";

export interface IGetUser extends  Omit<Usuario, "password">  {

}