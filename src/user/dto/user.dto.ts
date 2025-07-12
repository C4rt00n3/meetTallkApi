import { Min, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsLatitude, IsLongitude, IsNumber, IsIn, Max } from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from "class-transformer";
import { Gender, State } from "@prisma/client";
import { CreateLoginDto } from "src/auth/dto/created.login";

export class CreateLocation {
    @IsLatitude()
    @IsNotEmpty()
    latitude: string;

    @IsLongitude()
    @IsNotEmpty()
    longitude: string;

    @IsEnum(State)
    @IsOptional()
    state?: State;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    country?: string
}

export class PreferenceDto {
    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;
    @IsNotEmpty()
    @IsInt()
    @Max(18)
    maxAge: number
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    name: string; // 'name' no DTO para corresponder ao campo 'name' no Prisma

    @IsInt()
    @IsNotEmpty()
    @Min(18, { message: "A idade mínima é 18 anos." })
    age: number; // 'age' no DTO para corresponder ao campo 'idade' no Prisma

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender = Gender.M;  // 'gender' para corresponder a 'sexo' no Prisma

    @Type(() => CreateLoginDto)
    @IsNotEmpty()
    auth: CreateLoginDto;
    
    @Type(() => CreateLocation)
    @IsOptional()
    location?: CreateLocation; // 'location' para refletir 'localizacao' no Prisma

    @Type(() => PreferenceDto)
    @IsOptional()
    preference?: PreferenceDto; // 'location' para refletir 'localizacao' no Prisma
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }

export class FindUserParams {  // Corrigido de "FindUsariosParams" para "FindUsuariosParams"
    @IsString()
    @IsOptional()
    uuid?: string;

    @IsString()
    @IsOptional()
    name?: string;
}

export class GenericFilter {
    @IsOptional()
    @IsNumber({}, { message: '"page" attribute should be a number' })
    @Min(1, { message: '"page" must be at least 1' })
    public page: number = 1;

    @IsOptional()
    @IsNumber({}, { message: '"pageSize" attribute should be a number' })
    @Min(1, { message: '"pageSize" must be at least 1' })
    public pageSize: number = 10;

    @IsOptional()
    @IsString()
    name?: string

}