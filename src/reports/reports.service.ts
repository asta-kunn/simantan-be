import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaporanAlsintan, ReportType } from './entities/laporan-alsintan.entity';
import { SubmissionDocument, DocumentType } from './entities/submission-document.entity';
import { UpdateFormDto } from './dto/update-form.dto'; // DTO untuk data form
import { UpdateLaporanDto } from './dto/update-laporan.dto'; // DTO untuk dokumen
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
   * REVISI: Fungsi ini HANYA untuk mengupdate data dari form pemanfaatan.
   * Tidak ada lagi logika penanganan dokumen di sini.
   * Dipanggil oleh endpoint PATCH /:id/pemanfaatan
   */
  async updateForm(id: number, type: ReportType, dto: UpdateFormDto): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOneBy({ id, type });

    if (!report) {
      throw new NotFoundException(`Laporan dengan ID ${id} dan tipe ${type} tidak ditemukan`);
    }

    // 1. Update semua field dari DTO form
    report.tanggalAwalPenggunaan = dto.tanggalAwalPenggunaan;
    report.tanggalAkhirPenggunaan = dto.tanggalAkhirPenggunaan;
    report.totalAreaDikerjakan = dto.totalAreaDikerjakan;
    report.kondisiAlsintan = dto.kondisiAlsintan;
    report.perawatanDilakukan = dto.perawatanDilakukan;
    report.jenisAlsintan = dto.jenisAlsintan;
    report.merekAlsintan = dto.merekAlsintan;
    report.pengguna = dto.pengguna;
    report.lokasi = dto.lokasi;
    
    // 2. Set flag bahwa laporan pemanfaatan (form) sudah diisi
    report.isLaporanPemanfaatan = 'Y';

    // 3. Simpan perubahan pada data form
    return this.laporanRepository.save(report);
  }

  /**
   * REVISI: Fungsi ini HANYA untuk mengupdate/mengunggah dokumen.
   * Menangani versioning untuk kedua jenis dokumen (Kondisi & Pemanfaatan).
   * Dipanggil oleh endpoint PATCH /:id/kondisi
   */
  async updateLaporan(id: number, type: ReportType, dto: UpdateLaporanDto): Promise<LaporanAlsintan> {
    const report = await this.laporanRepository.findOne({
      where: { id: id, type: type },
      relations: ['documents'],
    });

    if (!report) {
      throw new NotFoundException(`Laporan dengan ID ${id} dan tipe ${type} tidak ditemukan`);
    }
    
    // Inisialisasi array jika belum ada
    if (!report.documents) {
      report.documents = [];
    }

    // 1. Proses Dokumen Kondisi jika URL diberikan
    if (dto.documentUrlKondisi) {
      // Nonaktifkan versi lama
      report.documents.forEach(doc => {
        if (doc.type === DocumentType.KONDISI && doc.isCurrent) {
          doc.isCurrent = false;
        }
      });
      // Tambahkan versi baru
      const newKondisiDoc = this.documentRepository.create({
        documentUrl: dto.documentUrlKondisi,
        version: new Date().toISOString(),
        isCurrent: true,
        type: DocumentType.KONDISI,
      });
      report.documents.push(newKondisiDoc);
      // Set flag bahwa laporan kondisi (dokumen) sudah ada
      report.isLaporanKondisi = 'Y';
    }

    // 2. Proses Dokumen Pemanfaatan jika URL diberikan
    if (dto.documentUrlPemanfaatan) {
        // Nonaktifkan versi lama
        report.documents.forEach(doc => {
            if (doc.type === DocumentType.PEMANFAATAN && doc.isCurrent) {
                doc.isCurrent = false;
            }
        });
        // Tambahkan versi baru
        const newPemanfaatanDoc = this.documentRepository.create({
            documentUrl: dto.documentUrlPemanfaatan,
            version: new Date().toISOString(),
            isCurrent: true,
            type: DocumentType.PEMANFAATAN,
        });
        report.documents.push(newPemanfaatanDoc);
        // Catatan: Flag isLaporanPemanfaatan di-set oleh form, bukan oleh upload dokumen ini.
    }

    // 3. Simpan semua perubahan (dokumen lama yang diupdate dan dokumen baru)
    return this.laporanRepository.save(report);
  }

  // --- Fungsi lain tidak perlu diubah ---

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
    // Build base query by type
    const qb = this.laporanRepository
      .createQueryBuilder('laporan')
      .where('laporan.type = :type', { type });

    // Apply normalized kel_desa filter if provided (lowercase, remove spaces)
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
