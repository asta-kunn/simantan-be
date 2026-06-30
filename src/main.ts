// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Instance Express yang akan dibagikan ke NestJS dan Vercel
const server = express.default();
let isBootstrapped = false;

async function bootstrap() {
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
  
  // Jika di Vercel, cukup inisialisasi tanpa listen port
  if (process.env.VERCEL) {
    await app.init();
  } else {
    // Jika di lokal, berjalan seperti biasa di port 8080
    await app.listen(process.env.PORT || 8080);
    console.log('Application is running locally on port 8080');
  }
}

// JALANKAN LANGSUNG JIKA DI LOKAL
if (!process.env.VERCEL) {
  bootstrap();
}

// HANDLER UNTUK VERCEL (Menunggu bootstrap selesai baru melayani request)
export default async (req: any, res: any) => {
  if (!isBootstrapped) {
    await bootstrap();
    isBootstrapped = true;
  }
  server(req, res);
};