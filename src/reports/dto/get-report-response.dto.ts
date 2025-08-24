// src/reports/dto/get-report-response.dto.ts
import { ReportType } from '../entities/laporan-alsintan.entity';

export class GetReportResponseDto {
  id: number;
  type: ReportType;
  kelurahanDesa: string;
  idPoktan: string;
  namaPoktan: string;
  ketuaPoktan: string;
  alamatSekretariat: string;
  status: string;
}