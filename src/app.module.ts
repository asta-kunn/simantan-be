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
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // PENTING: Otomatis membuat tabel. Matikan (false) di produksi.
    }),
    AuthModule,
    ReportsModule,
    WilayahModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}