import { PartialType } from '@nestjs/swagger';
import { CreateImageProfileDto } from './create-image-profile.dto';

export class UpdateImageProfileDto extends PartialType(CreateImageProfileDto) {}
