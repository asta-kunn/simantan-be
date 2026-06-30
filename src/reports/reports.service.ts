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

  /**
   * Mengupdate data dari form pemanfaatan.
   */
  async updateForm(id: number, type: ReportType, dto: UpdateFormDto): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOneBy({ id, type });

    if (!report) {
      throw new NotFoundException(`Laporan dengan ID ${id} dan tipe ${type} tidak ditemukan`);
    }

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

  /**
   * Mengupdate/mengunggah dokumen dengan versioning yang aman.
   */
  async updateLaporan(id: number, type: ReportType, dto: UpdateLaporanDto): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOne({
      where: { id: id, type: type },
      relations: ['documents'],
    });

    if (!report) {
      throw new NotFoundException(`Laporan dengan ID ${id} dan tipe ${type} tidak ditemukan`);
    }
    
    if (!report.documents) {
      report.documents = [];
    }

    const docsToSave: SubmissionDocument[] = [];

    // 1. Proses Dokumen Kondisi jika URL diberikan
    if (dto.documentUrlKondisi) {
      // Cari dan nonaktifkan versi lama secara eksplisit
      for (const doc of report.documents) {
        if (doc.type === DocumentType.KONDISI && doc.isCurrent) {
          doc.isCurrent = false;
          docsToSave.push(doc); // Simpan ke array untuk di-update di DB
        }
      }

      // Buat entitas dokumen baru
      const newKondisiDoc = this.documentRepository.create({
        documentUrl: dto.documentUrlKondisi,
        version: new Date().toISOString(), // Menggunakan ISO String sebagai penanda versi waktu
        isCurrent: true,
        type: DocumentType.KONDISI,
        laporan: report, // Hubungkan langsung foreign key-nya
      });
      docsToSave.push(newKondisiDoc);
      report.isLaporanKondisi = 'Y';
    }

    // 2. Proses Dokumen Pemanfaatan jika URL diberikan
    if (dto.documentUrlPemanfaatan) {
      // Cari dan nonaktifkan versi lama secara eksplisit
      for (const doc of report.documents) {
        if (doc.type === DocumentType.PEMANFAATAN && doc.isCurrent) {
          doc.isCurrent = false;
          docsToSave.push(doc); // Simpan ke array untuk di-update di DB
        }
      }

      // Buat entitas dokumen baru
      const newPemanfaatanDoc = this.documentRepository.create({
        documentUrl: dto.documentUrlPemanfaatan,
        version: new Date().toISOString(),
        isCurrent: true,
        type: DocumentType.PEMANFAATAN,
        laporan: report, // Hubungkan langsung foreign key-nya
      });
      docsToSave.push(newPemanfaatanDoc);
    }

    // Jika ada dokumen yang diproses, save entitas dokumennya dulu demi keamanan state data di Postgres
    if (docsToSave.length > 0) {
      await this.documentRepository.save(docsToSave);
    }

    // Simpan perubahan flag pada laporan_alsintan
    return this.laporanRepository.save(report);
  }

  async findOne(id: number): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOne({
      where: { id: id },
      relations: ['documents'],
    });

    if (!report) {
      throw new NotFoundException(`Laporan dengan ID ${id} tidak ditemukan`);
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