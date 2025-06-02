import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Adiciona validação global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));
  
  // Configuração do CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Todo List Web3')
    .setDescription('API para gerenciamento de tarefas usando smart contracts')
    .setVersion('1.0')
    .addTag('tasks')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();