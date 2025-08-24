// src/reports/dto/get-reports-query.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportType } from '../entities/laporan-alsintan.entity';

export class GetReportsQueryDto {
  @IsNotEmpty()
  @IsEnum(ReportType, { message: "Tipe harus 'APBN' atau 'APBD'" })
  type: ReportType;

  @IsOptional()
  @IsString()
  kel_desa: string;
}