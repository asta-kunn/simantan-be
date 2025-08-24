// src/reports/dto/update-laporan-kondisi.dto.ts
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateLaporanDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'documentUrl harus berupa URL yang valid' })
  documentUrlKondisi: string;

  @IsNotEmpty()
  @IsUrl({}, { message: 'documentUrl harus berupa URL yang valid' })
  documentUrlPemanfaatan: string;
  
}