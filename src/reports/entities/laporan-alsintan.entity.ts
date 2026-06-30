import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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
  id!: number;

  @Column({ name: 'kelurahan_desa', type: 'varchar', length: 100 })
  kelurahanDesa!: string;

  @Column({ name: 'id_poktan', type: 'varchar', length: 50 })
  idPoktan!: string;

  @Column({ name: 'nama_poktan', type: 'varchar', length: 150 })
  namaPoktan!: string;

  @Column({ name: 'ketua_poktan', type: 'varchar', length: 100 })
  ketuaPoktan!: string;

  @Column({ name: 'alamat_sekretariat', type: 'text' })
  alamatSekretariat!: string;

  @Column({ name: 'is_laporan_kondisi', type: 'char', length: 1, default: 'N' })
  isLaporanKondisi!: string; 

  @Column({ name: 'is_laporan_pemanfaatan', type: 'char', length: 1, default: 'N' })
  isLaporanPemanfaatan!: string; 

  @Column({ name: 'tanggal_awal_penggunaan', type: 'date', nullable: true })
  tanggalAwalPenggunaan!: Date;

  @Column({ name: 'tanggal_akhir_penggunaan', type: 'date', nullable: true })
  tanggalAkhirPenggunaan!: Date;

  // Menggunakan 'double precision' agar di JavaScript langsung dibaca sebagai number biasa
  @Column({ name: 'total_area_dikerjakan', type: 'double precision', nullable: true })
  totalAreaDikerjakan!: number;

  @Column({
    name: 'kondisi_alsintan',
    type: 'enum',
    enum: KondisiAlsintan,
    enumName: 'kondisi_alsintan_enum', // PENTING DI POSTGRES
    nullable: true,
  })
  kondisiAlsintan!: KondisiAlsintan;

  @Column({ name: 'jenis_alsintan', type: 'text', nullable: true })
  jenisAlsintan!: string;

  @Column({ name: 'merek_alsintan', type: 'text', nullable: true })
  merekAlsintan!: string;

  @Column({ name: 'perawatan_dilakukan', type: 'text', nullable: true })
  perawatanDilakukan!: string;

  @Column({ name: 'pengguna', type: 'text', nullable: true })
  pengguna!: string;

  @Column({ name: 'lokasi', type: 'text', nullable: true })
  lokasi!: string;
  
  @Column({
    type: 'enum',
    enum: ReportType,
    enumName: 'report_type_enum', // PENTING DI POSTGRES
    nullable: true
  })
  type!: ReportType;

  @OneToMany(() => SubmissionDocument, document => document.laporan, { cascade: true })
  documents!: SubmissionDocument[];
}