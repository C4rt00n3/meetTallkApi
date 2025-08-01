import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, Req, Res } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { MessageType, User } from '@prisma/client';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreateMessageDto, DeleteMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import * as mime from 'mime-types';
import * as fs from 'fs';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService
  ) { }


  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async create(
    @Req() req: Request,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
        exceptionFactory: (errors) => {
          console.log(errors);
          return new BadRequestException(errors);
        },
      })
    )
    file?: Express.Multer.File,
  ) {

    
    const createMensageDto = new CreateMessageDto();
    Object.assign(createMensageDto, req.body);

    if(file == null && (createMensageDto.text == "" || createMensageDto.text == null))
      throw new BadRequestException("O campo de texto não pode ser vazio")

    const errors = await validate(createMensageDto);
    
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const body = req.body as unknown as any

    if (body?.type) {
      createMensageDto.type = body.type as MessageType;
    }
    if (body?.createdAt) {
      createMensageDto.createdAt = body.createdAt as string; 
    }

    return this.messageService.create(createMensageDto, user, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: User) {
    return this.messageService.findAll(user);
  }

  @Get("image/:uuid/:chat_uuid")
  @UseGuards(AuthGuard)
  async findImage(
    @Param('uuid') id: string,
    @Param('chat_uuid') chat_uuid: string,
    @GetUser() user: User,
    @Res() res: Response
  ) {
    try {
      const image = await this.messageService.getImageMessage(id, chat_uuid, user);
      
      if (!image) {
        return res.status(404).send('Imagem não encontrada');
      }

      let imageBuffer: Buffer;
      if (image.src instanceof Buffer) {
        imageBuffer = image.src;
      } else if (image.src instanceof Uint8Array) {
        imageBuffer = Buffer.from(image.src);
      } else {
        const mimeType = mime.lookup(image.src) || 'application/octet-stream';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline');

        const fileStream = fs.createReadStream(image.src);
        fileStream.on('error', (err) => {
          res.status(404).send('Arquivo não encontrado');
        });
        return fileStream.pipe(res);
      }

      const mimeType = mime.lookup('image.png') || 'application/octet-stream'; // Substitua por lógica real
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');

      res.end(imageBuffer);
    } catch (error) {
      console.log(error)
      res.status(500).send('Erro interno do servidor');
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.messageService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateMensageDto: UpdateMessageDto, @GetUser() user: User) {
    return this.messageService.update(id, updateMensageDto, user);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async remove(
    @Body() deleteDto: DeleteMessageDto,
    @GetUser() user: User,
    @Query() query: { safe: boolean }
  ): Promise<void> {
    return this.messageService.delete(deleteDto, user, query);
  }

  @Get("list/updated/")
  @UseGuards(AuthGuard)
  async listMessagesUpdated(
    @GetUser() user: User
  ) {
    return this.messageService.listMessagUpdated(user);
  }

  @Get("markRead/:chat_uuid")
  @UseGuards(AuthGuard)
  markRead(
    @Param("chat_uuid") uuid: string,
    @GetUser() user: User
  ) {
    return this.messageService.markRead(uuid, user);
  }
}

