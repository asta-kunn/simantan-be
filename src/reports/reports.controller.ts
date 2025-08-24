// src/reports/reports.controller.ts
import { Controller, Get, Patch, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UpdateFormDto } from './dto/update-form.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(@Query() query: GetReportsQueryDto) {
    return this.reportsService.findAll(query.type, query.kel_desa);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportsService.findOne(id); 
  }

  // MODIFIKASI DI SINI
  @Patch(':id/form')
  updateForm(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetReportsQueryDto, // <-- Tambahkan Query Param
    @Body() updateDto: UpdateFormDto,
  ) {
    // Kirim id dan type ke service
    return this.reportsService.updateForm(id, query.type, updateDto);
  }

  // MODIFIKASI DI SINI
  @Patch(':id/laporan')
  updateLaporan(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetReportsQueryDto, // <-- Tambahkan Query Param
    @Body() updateDto: UpdateLaporanDto,
  ) {
    // Kirim id dan type ke service
    return this.reportsService.updateLaporan(id, query.type, updateDto);
  }
}