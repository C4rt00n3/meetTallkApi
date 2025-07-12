import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateLoginDto {
    @ApiProperty({description: "Email do usuário", required: true})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "Senha do usuário", required: true, minLength: 8, maxLength: 120})
    @IsString()
    @MaxLength(120)
    @MinLength(8)
    @IsNotEmpty()
    password: string
}