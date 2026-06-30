// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Buat instance express di luar untuk di-export ke Vercel
const server = express.default();

async function bootstrap() {
  // Gunakan ExpressAdapter agar NestJS menempel ke instance express di atas
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'https://simantan-5wc7q.ondigitalocean.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Api-Key',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe()); 
  
  // Jika berjalan di lokal, gunakan listen. Jika di Vercel, gunakan init saja
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(process.env.PORT || 8080);
  } else {
    await app.init();
  }
}

// Jalankan fungsi bootstrap
bootstrap();

// EXPORT server ini agar Vercel bisa membacanya
export default server;