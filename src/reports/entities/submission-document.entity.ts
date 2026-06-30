import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LaporanAlsintan } from './laporan-alsintan.entity';

export enum DocumentType {
  KONDISI = 'KONDISI',
  PEMANFAATAN = 'PEMANFAATAN',
}

@Entity('submission_documents')
export class SubmissionDocument {
  @PrimaryGeneratedColumn()
  document_id!: number;

  @Column({ name: 'document_url', type: 'varchar', length: 255 })
  documentUrl!: string;

  @Column({ name: 'version', type: 'varchar', length: 50, default: '1' }) // Berikan tipe eksplisit
  version!: string;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ 
    type: 'enum', 
    enum: DocumentType,
    enumName: 'document_type_enum' // PENTING DI POSTGRES: Berikan nama enum agar skema rapi
  })
  type!: DocumentType;

  @ManyToOne(() => LaporanAlsintan, laporan => laporan.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'laporan_alsintan_id' }) 
  laporan!: LaporanAlsintan;
}