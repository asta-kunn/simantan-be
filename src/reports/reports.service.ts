// src/reports/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaporanAlsintan, ReportType } from './entities/laporan-alsintan.entity';
import { SubmissionDocument, DocumentType } from './entities/submission-document.entity';
import { UpdateFormDto } from './dto/update-form.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { GetReportResponseDto } from './dto/get-report-response.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(LaporanAlsintan)
    private laporanRepository: Repository<LaporanAlsintan>,
    @InjectRepository(SubmissionDocument)
    private documentRepository: Repository<SubmissionDocument>,
  ) {}

  private async getOrCreateReport(
    idPoktan: string, 
    type: ReportType, 
    masterData: { kelurahanDesa: string, namaPoktan: string, ketuaPoktan: string, alamatSekretariat: string }
  ): Promise<LaporanAlsintan> {
    let report = await this.laporanRepository.findOne({
      where: { idPoktan, type },
      relations: ['documents'],
    });

    if (!report) {
      // Kita cukup CREATE secara memori, TIDAK perlu di-save di sini.
      // Akan di-save sekalian beserta dokumennya menggunakan Cascade TypeORM.
      report = this.laporanRepository.create({
        idPoktan,
        type,
        kelurahanDesa: masterData.kelurahanDesa,
        namaPoktan: masterData.namaPoktan,
        ketuaPoktan: masterData.ketuaPoktan,
        alamatSekretariat: masterData.alamatSekretariat,
        isLaporanKondisi: 'N',
        isLaporanPemanfaatan: 'N',
        documents: [], // Array harus diinisialisasi
      });
    }

    return report;
  }

  async updateForm(idPoktan: string, type: ReportType, dto: UpdateFormDto): Promise<LaporanAlsintan> {
    const report = await this.getOrCreateReport(idPoktan, type, dto);

    report.tanggalAwalPenggunaan = dto.tanggalAwalPenggunaan;
    report.tanggalAkhirPenggunaan = dto.tanggalAkhirPenggunaan;
    report.totalAreaDikerjakan = dto.totalAreaDikerjakan;
    report.kondisiAlsintan = dto.kondisiAlsintan;
    report.perawatanDilakukan = dto.perawatanDilakukan;
    report.jenisAlsintan = dto.jenisAlsintan;
    report.merekAlsintan = dto.merekAlsintan;
    report.pengguna = dto.pengguna;
    report.lokasi = dto.lokasi;
    
    report.isLaporanPemanfaatan = 'Y';

    return this.laporanRepository.save(report);
  }

  async updateLaporan(idPoktan: string, type: ReportType, dto: UpdateLaporanDto): Promise<LaporanAlsintan> {
    const report = await this.getOrCreateReport(idPoktan, type, dto);

    // 1. Proses Dokumen Kondisi
    if (dto.documentUrlKondisi) {
      // Ubah yang lama jadi tidak current
      report.documents.forEach(doc => {
        if (doc.type === DocumentType.KONDISI && doc.isCurrent) {
          doc.isCurrent = false;
        }
      });

      // Buat instance dokumen baru (TIDAK ADA property 'laporan: report' di sini, biarkan cascade bekerja)
      const newKondisiDoc = this.documentRepository.create({
        documentUrl: dto.documentUrlKondisi,
        version: new Date().toISOString(), 
        isCurrent: true,
        type: DocumentType.KONDISI,
      });
      
      // PUSH ke array dokumen di dalam report
      report.documents.push(newKondisiDoc);
      report.isLaporanKondisi = 'Y';
    }

    // 2. Proses Dokumen Pemanfaatan
    if (dto.documentUrlPemanfaatan) {
      // Ubah yang lama jadi tidak current
      report.documents.forEach(doc => {
        if (doc.type === DocumentType.PEMANFAATAN && doc.isCurrent) {
          doc.isCurrent = false;
        }
      });

      const newPemanfaatanDoc = this.documentRepository.create({
        documentUrl: dto.documentUrlPemanfaatan,
        version: new Date().toISOString(),
        isCurrent: true,
        type: DocumentType.PEMANFAATAN,
      });

      // PUSH ke array dokumen di dalam report
      report.documents.push(newPemanfaatanDoc);
      report.isLaporanPemanfaatan = 'Y';
    }

    // AJAIBNYA TYPEORM: Karena kita sudah set cascade: true di LaporanAlsintan,
    // cukup jalankan 1 perintah ini. TypeORM akan otomatis menyimpan Laporan, 
    // lalu menyimpan Dokumen-dokumen baru, dan mengisi 'laporan_alsintan_id'-nya!
    return this.laporanRepository.save(report);
  }

  async findOne(idPoktan: string, type: ReportType): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOne({
      where: { idPoktan, type },
      relations: ['documents'],
    });

    if (!report) {
      throw new NotFoundException(`Laporan untuk Poktan ${idPoktan} dengan tipe ${type} belum dibuat.`);
    }

    return report;
  }
  
  async findAll(type: ReportType, kel_desa: string): Promise<GetReportResponseDto[]> {
    const qb = this.laporanRepository
      .createQueryBuilder('laporan')
      .where('laporan.type = :type', { type });

    if (kel_desa && kel_desa.trim().length > 0) {
      const normalizedKel = kel_desa.toLowerCase().replace(/\s+/g, '');
      qb.andWhere("LOWER(REPLACE(laporan.kelurahan_desa, ' ', '')) = :normalizedKel", {
        normalizedKel,
      });
    }

    const allReports = await qb.getMany();

    return allReports.map(report => {
      const response = new GetReportResponseDto();
      response.id = report.id;
      response.type = report.type;
      response.kelurahanDesa = report.kelurahanDesa;
      response.idPoktan = report.idPoktan;
      response.namaPoktan = report.namaPoktan;
      response.ketuaPoktan = report.ketuaPoktan;
      response.alamatSekretariat = report.alamatSekretariat;
      response.status = this.determineStatus(report);
      return response;
    });
  }

  private determineStatus(report: LaporanAlsintan): string {
    const hasKondisi = report.isLaporanKondisi === 'Y';
    const hasPemanfaatan = report.isLaporanPemanfaatan === 'Y';
    if (hasKondisi && hasPemanfaatan) return 'Completed';
    if (!hasKondisi && !hasPemanfaatan) return 'Laporan Kondisi & Pemanfaatan Belum';
    if (!hasKondisi) return 'Laporan Kondisi Belum';
    if (!hasPemanfaatan) return 'Laporan Pemanfaatan Belum';
    return 'Pending';
  }
}