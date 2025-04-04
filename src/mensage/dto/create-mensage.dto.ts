import { Tipo } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateMensageDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsEnum(Tipo)
    @IsOptional()
    type: Tipo = Tipo.T;

    @IsString()
    @IsOptional()
    @IsUrl()
    url?: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    recieve_id: string;
}
