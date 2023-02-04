import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Food Delivery')
    .setDescription('Food Delivery API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const fs = require('fs');
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

  SwaggerModule.setup('/', app, document);

  await app.listen(3000);
}
bootstrap();
