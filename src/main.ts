import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Api-Key',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe()); 
  
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
