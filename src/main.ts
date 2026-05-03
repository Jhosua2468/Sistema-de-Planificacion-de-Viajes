import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para Vue.js
  app.enableCors();

  // Activar validaciones estrictas en todo el proyecto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Quita datos basura que envíe el usuario
      forbidNonWhitelisted: true, // Lanza error si envían datos no definidos en el DTO
    }),
  );

  await app.listen(3000);
}
bootstrap();
