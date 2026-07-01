import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WilayahService implements OnModuleInit {
  private db: any = {
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    poktan: []
  };

  // Lifecycle hook NestJS: Load file JSON ke memory (RAM) saat aplikasi baru nyala
  onModuleInit() {
    try {
      // Sesuaikan path ini dengan lokasi file JSON kamu
      // process.cwd() menunjuk ke root folder project saat dijalankan
      const dataPath = path.join(process.cwd(), 'src/data/data_wilayah.json'); 
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.db = JSON.parse(rawData);
      console.log(`Data Wilayah berhasil diload: ${this.db.provinsi.length} Provinsi.`);
    } catch (error) {
      console.error('Gagal meload file JSON wilayah. Pastikan file ada di lokasi yang benar.', error);
    }
  }

  async getProvinsi() {
    try {
      return this.db.provinsi;
    } catch (error) {
      throw new InternalServerErrorException('Gagal memproses data Provinsi');
    }
  }

  async getKabupaten(provinsiId: string) {
    try {
      return this.db.kabupaten.filter(kab => kab.provinsiId === provinsiId);
    } catch (error) {
      throw new InternalServerErrorException('Gagal memproses data Kabupaten');
    }
  }

  async getKecamatan(kabupatenId: string) {
    try {
      return this.db.kecamatan.filter(kec => kec.kabupatenId === kabupatenId);
    } catch (error) {
      throw new InternalServerErrorException('Gagal memproses data Kecamatan');
    }
  }

  async getPoktan(provinsiId: string, kabupatenId: string, kecamatanId: string) {
    try {
      // Menggunakan kombinasi filter ID agar lebih aman dan spesifik
      return this.db.poktan.filter(
        poktan => 
          poktan.provinsiId === provinsiId &&
          poktan.kabupatenId === kabupatenId &&
          poktan.kecamatanId === kecamatanId
      );
    } catch (error) {
      throw new InternalServerErrorException('Gagal memproses data Poktan');
    }
  }
}