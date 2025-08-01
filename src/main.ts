import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv'; // Importe a biblioteca dotenv

async function bootstrap() {
dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, 
      },
      exceptionFactory: (errors) => {
        return new BadRequestException(errors);
      },
    })
  );

  const logger = new Logger('Bootstrap');
 app.listen(3000, () => logger.log('Application is running on: http://localhost:3000'));
}
bootstrap();
