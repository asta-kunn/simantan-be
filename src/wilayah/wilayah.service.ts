import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class WilayahService {
  private readonly URL_MONPETANI = 'https://app3.pertanian.go.id/simluh/monpetanikec.php';
  private readonly URL_KABUPATEN = 'https://app3.pertanian.go.id/simluh/getProvinsi.php';
  private readonly URL_KECAMATAN = 'https://app3.pertanian.go.id/simluh/getKecamatan.php';
  private readonly URL_POKTAN = 'https://app3.pertanian.go.id/simluh/rekappetanikec.php';

  async getProvinsi() {
    try {
      const response = await fetch(this.URL_MONPETANI);
      const html = await response.text();
      const $ = cheerio.load(html);
      const provinsi: { id: string; name: string }[] = [];

      // Ambil opsi dari dropdown Provinsi (cmbNegara)
      $('#cmbNegara option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        
        // Lewati opsi kosong "--Pilih Provinsi--"
        if (id && id !== '') {
          provinsi.push({ id, name });
        }
      });

      return provinsi;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Provinsi');
    }
  }

  async getKabupaten(provinsiId: string) {
    try {
      // Perhatikan: Source web pakai payload 'idNegara' untuk mengambil Kabupaten
      const response = await fetch(this.URL_KABUPATEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ idNegara: provinsiId }),
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const kabupaten: { id: string; name: string }[] = [];

      $('option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        if (id && name) {
          kabupaten.push({ id, name });
        }
      });

      return kabupaten;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Kabupaten');
    }
  }

  async getKecamatan(kabupatenId: string) {
    try {
      // Source web pakai payload 'idProvinsi' untuk mengambil Kecamatan
      const response = await fetch(this.URL_KECAMATAN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ idProvinsi: kabupatenId }),
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const kecamatan: { id: string; name: string }[] = [];

      $('option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        if (id && name) {
          kecamatan.push({ id, name });
        }
      });

      return kecamatan;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Kecamatan');
    }
  }

  async getPoktan(provinsiId: string, kabupatenId: string, kecamatanId: string) {
    try {
      const response = await fetch(this.URL_POKTAN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          cmbNegara: provinsiId,    // Sesuai source: cmbNegara = Provinsi
          cmbProvinsi: kabupatenId, // Sesuai source: cmbProvinsi = Kabupaten
          cmbKecamatan: kecamatanId,
        }),
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const poktanList: {
        desa: string;
        id_poktan: string;
        nama_poktan: string;
        ketua_poktan: string;
        alamat: string;
      }[] = [];

      $('table table tr').each((index, element) => {
        if (index > 0) {
          const tds = $(element).find('td');
          if (tds.length >= 6) {
            poktanList.push({
              desa: $(tds[1]).text().trim(),
              id_poktan: $(tds[2]).text().trim(),
              nama_poktan: $(tds[3]).text().trim(),
              ketua_poktan: $(tds[4]).text().trim(),
              alamat: $(tds[5]).text().trim(),
            });
          }
        }
      });

      return poktanList;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Poktan');
    }
  }
}