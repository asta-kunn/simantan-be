// src/reports/entities/submission-document.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LaporanAlsintan } from './laporan-alsintan.entity';

// PENAMBAHAN ENUM UNTUK TIPE DOKUMEN
export enum DocumentType {
  KONDISI = 'KONDISI',
  PEMANFAATAN = 'PEMANFAATAN',
}

@Entity('submission_documents')
export class SubmissionDocument {
  @PrimaryGeneratedColumn()
  document_id: number;

  @Column({ name: 'document_url' })
  documentUrl: string;

  @Column({ name: 'version' })
  version: string;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent: boolean;

  // PENAMBAHAN KOLOM TIPE DOKUMEN
  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  // PERUBAHAN: Relasi disatukan menjadi satu
  @ManyToOne(() => LaporanAlsintan, laporan => laporan.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'laporan_alsintan_id' }) // Definisikan foreign key secara eksplisit
  laporan: LaporanAlsintan;
}