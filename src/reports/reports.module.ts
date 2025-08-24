// src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LaporanAlsintan } from './entities/laporan-alsintan.entity';
import { SubmissionDocument } from './entities/submission-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LaporanAlsintan, SubmissionDocument])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}