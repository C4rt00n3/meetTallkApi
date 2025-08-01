import { Min, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsLatitude, IsLongitude, IsNumber, IsIn, Max, IsDate, ValidationOptions, ValidationArguments, registerDecorator, ValidateNested, IsBoolean } from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { Type } from "class-transformer";
import { Gender, Provider } from "@prisma/client";
import { CreateLoginDto } from "src/auth/dto/created.login";

export function IsMinAge(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMinAge',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minAge],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) {
            return false; // Deve ser uma instância de Date
          }
          const [minAllowedAge] = args.constraints;
          const birthDate = value;
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= minAllowedAge;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAllowedAge] = args.constraints;
          return `A idade mínima é ${minAllowedAge} anos.`;
        }
      },
    });
  };
}

export class CreateLocation {
    @IsLatitude()
    @IsNotEmpty()
    latitude: string;

    @IsLongitude()
    @IsNotEmpty()
    longitude: string;

    @IsString()
    @IsOptional()
    state?: string;

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

export class CreatePrivacyUserDto {
  @IsOptional()
  @IsBoolean()
  noMarkRead: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  imageBreak: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  talkBreak: number = 0
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    name: string;

    @IsDate()
    @IsNotEmpty()
    @IsMinAge(18, { message: "O usuário deve ter pelo menos 18 anos." }) // Use seu validador personalizado
    @Type(() => Date) // Importante para garantir que o input seja convertido para Date
    birthDate: Date; // Campo renomeado para 'birthDate'

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender = Gender.M;

    @IsEnum(Provider)
    @IsOptional()
    provider?: Provider = Provider.app;

    @Type(() => CreateLoginDto)
    @ValidateNested() 
    @IsNotEmpty()
    auth: CreateLoginDto;
    
    @Type(() => CreateLocation)
    @ValidateNested()
    @IsOptional()
    location?: CreateLocation;

    @Type(() => PreferenceDto)
    @ValidateNested()
    @IsOptional()
    preference?: PreferenceDto;

    @Type(() => CreatePrivacyUserDto)
    @ValidateNested()
    @IsOptional()
    privacyUser: CreatePrivacyUserDto
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