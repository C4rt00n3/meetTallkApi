import { ApiProperty } from "@nestjs/swagger";
import { MessageType } from "@prisma/client";
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({ example: 'Olá, tudo bem?' })
  @IsString()
  text: string;

  @ApiProperty({ example: "2025-06-21T14:10:00.000Z", required: false })
  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType = MessageType.TEXT;
  
  @ApiProperty({ example: 'uuid-do-recebedor' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ required: false, example: 'uuid-da-mensagem-original' })
  @IsUUID()
  @IsOptional()
  replyToId?: string; // <- Adiciona suporte a respostas
}

export class DeleteMessageDto {
  @ApiProperty({
    description: 'Lista de IDs das mensagens a serem deletadas',
    type: [String],
    example: ['msgId1', 'msgId2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[]
}
