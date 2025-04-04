import { Estado, Sexo } from "@prisma/client";
import { Min, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsLatitude, IsLongitude } from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { CraeteLogin } from "src/auth/dto/created.login";
import { Type } from "class-transformer";

export class CreateLocalizacao {
    @IsLatitude()
    @IsNotEmpty()
    Lat: string;

    @IsLongitude()
    @IsNotEmpty()
    Lng: string;

    @IsEnum(Estado)
    @IsOptional()
    estado: Estado;

    @IsString()
    @IsOptional()
    municipio?: string;
}

export class UsuarioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    nome: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    imagemUrl?: string;

    @IsInt()
    @IsNotEmpty()
    @Min(18, { message: "A idade mínima é 18 anos." })
    idade: number;

    @IsEnum(Sexo)
    @IsOptional()
    sexo: Sexo = Sexo.M;

    @Type(() => CraeteLogin)
    @IsNotEmpty()
    autenticacao: CraeteLogin;

    @Type(() => CreateLocalizacao) // ✅ Agora pode ser usada corretamente
    @IsOptional()
    localizacao?: CreateLocalizacao;
}

export class UpdateUsuarioDto extends PartialType(UsuarioDto) { }

export class FindUsariosParams {
    @IsString()
    @IsOptional()
    uuid?: string;

    @IsString()
    @IsOptional()
    nome?: string;
}
