// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { WilayahModule } from './wilayah/wilayah.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // <-- UBAH DI SINI
      host: process.env.DB_HOST,
      // Default port PostgreSQL adalah 5432
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432, 
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      autoLoadEntities: true,
      synchronize: true, // Biarkan true sementara agar NestJS membuat skema Postgres secara otomatis
    }),
    AuthModule,
    ReportsModule,
    WilayahModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}