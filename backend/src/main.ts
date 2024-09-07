import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
        'http://localhost:8000',
        'https://rysaev-diploma.nomorepartiesco.ru'
    ],
  });

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
