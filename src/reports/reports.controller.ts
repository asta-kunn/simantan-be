// src/reports/reports.controller.ts
import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
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

  @Get(':idPoktan')
  findOne(
    @Param('idPoktan') idPoktan: string,
    @Query() query: GetReportsQueryDto
  ) {
    return this.reportsService.findOne(idPoktan, query.type); 
  }

  // Parameter diubah menjadi string idPoktan
  @Patch(':idPoktan/form')
  updateForm(
    @Param('idPoktan') idPoktan: string,
    @Query() query: GetReportsQueryDto,
    @Body() updateDto: UpdateFormDto,
  ) {
    return this.reportsService.updateForm(idPoktan, query.type, updateDto);
  }

  // Parameter diubah menjadi string idPoktan
  @Patch(':idPoktan/laporan')
  updateLaporan(
    @Param('idPoktan') idPoktan: string,
    @Query() query: GetReportsQueryDto,
    @Body() updateDto: UpdateLaporanDto,
  ) {
    return this.reportsService.updateLaporan(idPoktan, query.type, updateDto);
  }
}