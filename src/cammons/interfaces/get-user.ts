import { User } from "@prisma/client";

export interface IGetUser extends  Omit<User, "password">  {

}