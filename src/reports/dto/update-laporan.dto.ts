// src/reports/dto/update-laporan-kondisi.dto.ts
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateLaporanDto {
  // --- MASTER DATA POKTAN (Dibutuhkan untuk Upsert awal) ---
  @IsNotEmpty() @IsString() kelurahanDesa!: string;
  @IsNotEmpty() @IsString() namaPoktan!: string;
  @IsNotEmpty() @IsString() ketuaPoktan!: string;
  @IsNotEmpty() @IsString() alamatSekretariat!: string;
  // ---------------------------------------------------------

  @IsNotEmpty() @IsString()
  documentUrlKondisi!: string;

  @IsNotEmpty() @IsString()
  documentUrlPemanfaatan!: string;
}