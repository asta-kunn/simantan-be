// src/reports/dto/update-laporan-pemanfaatan.dto.ts
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
import { KondisiAlsintan } from '../entities/laporan-alsintan.entity';

export class UpdateFormDto {
  @IsNotEmpty()
  @IsDateString()
  tanggalAwalPenggunaan: Date;

  @IsNotEmpty()
  @IsDateString()
  tanggalAkhirPenggunaan: Date;

  @IsNotEmpty()
  @IsNumber()
  totalAreaDikerjakan: number;

  @IsNotEmpty()
  @IsEnum(KondisiAlsintan)
  kondisiAlsintan: KondisiAlsintan;

  @IsNotEmpty()
  @IsString()
  jenisAlsintan: string;

  @IsNotEmpty()
  @IsString()
  merekAlsintan: string;

  @IsNotEmpty()
  @IsString()
  perawatanDilakukan: string;

  @IsNotEmpty()
  @IsString()
  pengguna: string;

  @IsNotEmpty()
  @IsString()
  lokasi: string;

}