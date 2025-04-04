import { PartialType } from '@nestjs/swagger';
import { CreateMensageDto } from './create-mensage.dto';

export class UpdateMensageDto extends PartialType(CreateMensageDto) {}
