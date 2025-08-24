// src/reports/entities/laporan-alsintan.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
// PERUBAHAN: Import SubmissionDocument saja
import { SubmissionDocument } from './submission-document.entity';

export enum KondisiAlsintan {
  OPERASIONAL = 'Operasional',
  TIDAK_OPERASIONAL = 'Tidak Operasional',
}

export enum ReportType {
  APBN = 'APBN',
  APBD = 'APBD',
}

@Entity('laporan_alsintan')
export class LaporanAlsintan {
  @PrimaryGeneratedColumn()
  id: number;

  // ... (semua kolom lain tetap sama)
  @Column({ name: 'kelurahan_desa' })
  kelurahanDesa: string;

  @Column({ name: 'id_poktan' })
  idPoktan: string;

  @Column({ name: 'nama_poktan' })
  namaPoktan: string;

  @Column({ name: 'ketua_poktan' })
  ketuaPoktan: string;

  @Column({ name: 'alamat_sekretariat' })
  alamatSekretariat: string;

  @Column({ name: 'is_laporan_kondisi', type: 'char', length: 1, default: 'N' })
  isLaporanKondisi: string; // Y or N

  @Column({ name: 'is_laporan_pemanfaatan', type: 'char', length: 1, default: 'N' })
  isLaporanPemanfaatan: string; // Y or N

  @Column({ name: 'tanggal_awal_penggunaan', type: 'date', nullable: true })
  tanggalAwalPenggunaan: Date;

  @Column({ name: 'tanggal_akhir_penggunaan', type: 'date', nullable: true })
  tanggalAkhirPenggunaan: Date;

  @Column({ name: 'total_area_dikerjakan', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAreaDikerjakan: number;

  @Column({
    name: 'kondisi_alsintan',
    type: 'enum',
    enum: KondisiAlsintan,
    nullable: true,
  })
  kondisiAlsintan: KondisiAlsintan;

  @Column({ name: 'jenis_alsintan', type: 'text', nullable: true })
  jenisAlsintan: string;

  @Column({ name: 'merek_alsintan', type: 'text', nullable: true })
  merekAlsintan: string;

  @Column({ name: 'perawatan_dilakukan', type: 'text', nullable: true })
  perawatanDilakukan: string;

  @Column({ name: 'pengguna', type: 'text', nullable: true })
  pengguna: string;

  @Column({ name: 'lokasi', type: 'text', nullable: true })
  lokasi: string;
  
  @Column({
    type: 'enum',
    enum: ReportType,
    nullable: true
  })
  type: ReportType;
  // ... (akhir dari kolom yang sama)

  // PERUBAHAN: Relasi disatukan menjadi satu
  @OneToMany(() => SubmissionDocument, document => document.laporan, { cascade: true })
  documents: SubmissionDocument[];
}