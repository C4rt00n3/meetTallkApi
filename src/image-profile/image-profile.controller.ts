import { Controller, Get, Post, Patch, Param, Delete, UseInterceptors, UploadedFile, MaxFileSizeValidator, ParseFilePipe, FileTypeValidator, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { ImageProfileService } from './image-profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import * as mime from 'mime-types';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Controller('image-profile')
export class ImageProfileController {
  constructor(private readonly imageProfileService: ImageProfileService) { }

  @Post(":slot")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: true,
        exceptionFactory: (errors) => {
          return new BadRequestException(errors);
        },
      }),
    )
    file: Express.Multer.File,
    @Param('slot') slot: string,
    @GetUser() user: User,
  ) {
    const optimizedFile = await this.optimizedFile(file)
    if(+slot > 6 || +slot == 0) {
      throw new BadRequestException("Slot limitado 1..5")
    }
    return await this.imageProfileService.create(optimizedFile, user, +slot);
  }

  async optimizedFile(file: Express.Multer.File) {
    const processedImage = await sharp(file.buffer)
      .resize({ width: 1024 }) // Reduz a largura
      .jpeg({ quality: 80 })   // Comprime a imagem
      .toBuffer();

    return {
      ...file,
      buffer: processedImage,
      size: processedImage.length,
      mimetype: 'image/jpeg',
      originalname: file.originalname.replace(/\.[^/.]+$/, '.jpeg'),
    } as Express.Multer.File;
  }

  @Get(':uuid')
  @UseGuards(AuthGuard)
  async getImage(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const image = await this.imageProfileService.findOne(uuid);
  
      if (!image) {
        return res.status(404).send('Imagem não encontrada');
      }
  
      // Verifica se `image.src` é um Buffer ou Uint8Array
      let imageBuffer: Buffer;
      if (image.src instanceof Buffer) {
        imageBuffer = image.src;
      } else if (image.src instanceof Uint8Array) {
        imageBuffer = Buffer.from(image.src);
      } else {
        // Se for uma string (caminho do arquivo), usa fs.createReadStream
        const mimeType = mime.lookup(image.src) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline');
  
        const fileStream = fs.createReadStream(image.src);
        fileStream.on('error', (err) => {
          res.status(404).send('Arquivo não encontrado');
        });
        return fileStream.pipe(res);
      }
  
      // Detecta o MIME type (se possível)
      const mimeType = mime.lookup('image.png') || 'application/octet-stream'; // Substitua por lógica real
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');
  
      // Envia o buffer diretamente
      res.end(imageBuffer);
    } catch (error) {
      console.log(error)
      res.status(500).send('Erro interno do servidor');
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard)
  remove(@Param('uuid') uuid: string, @GetUser() user: User) {
    return this.imageProfileService.remove(uuid, user);
  }
}
