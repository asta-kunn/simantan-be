import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class WilayahService {
  private readonly URL_MONPETANI = 'https://app3.pertanian.go.id/simluh/monpetanikec.php';
  private readonly URL_KABUPATEN = 'https://app3.pertanian.go.id/simluh/getProvinsi.php';
  private readonly URL_KECAMATAN = 'https://app3.pertanian.go.id/simluh/getKecamatan.php';
  private readonly URL_POKTAN = 'https://app3.pertanian.go.id/simluh/rekappetanikec.php';

  // Standarisasi Headers untuk menyamar sebagai browser asli
  private readonly defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  async getProvinsi() {
    try {
      const response = await fetch(this.URL_MONPETANI, { headers: this.defaultHeaders });
      const html = await response.text();
      
      console.log("[DEBUG getProvinsi] Status:", response.status);
      
      const $ = cheerio.load(html);
      const provinsi: { id: string; name: string }[] = [];

      $('#cmbNegara option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        if (id && id !== '') provinsi.push({ id, name });
      });

      if (provinsi.length === 0) console.log("[DEBUG getProvinsi] HTML KOSONG:", html.substring(0, 300));

      return provinsi;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Provinsi');
    }
  }

  async getKabupaten(provinsiId: string) {
    try {
      const response = await fetch(this.URL_KABUPATEN, {
        method: 'POST',
        headers: { 
            ...this.defaultHeaders,
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({ idNegara: provinsiId }),
      });

      const html = await response.text();
      console.log(`[DEBUG getKabupaten ${provinsiId}] Status:`, response.status);

      const $ = cheerio.load(html);
      const kabupaten: { id: string; name: string }[] = [];

      $('option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        if (id && name) kabupaten.push({ id, name });
      });

      if (kabupaten.length === 0) console.log("[DEBUG getKabupaten] HTML KOSONG:", html.substring(0, 300));

      return kabupaten;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Kabupaten');
    }
  }

  async getKecamatan(kabupatenId: string) {
    try {
      const response = await fetch(this.URL_KECAMATAN, {
        method: 'POST',
        headers: { 
            ...this.defaultHeaders,
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({ idProvinsi: kabupatenId }),
      });

      const html = await response.text();
      console.log(`[DEBUG getKecamatan ${kabupatenId}] Status:`, response.status);

      const $ = cheerio.load(html);
      const kecamatan: { id: string; name: string }[] = [];

      $('option').each((_, element) => {
        const id = $(element).attr('value');
        const name = $(element).text().trim();
        if (id && name) kecamatan.push({ id, name });
      });

      if (kecamatan.length === 0) console.log("[DEBUG getKecamatan] HTML KOSONG:", html.substring(0, 300));

      return kecamatan;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Kecamatan');
    }
  }

  async getPoktan(provinsiId: string, kabupatenId: string, kecamatanId: string) {
    try {
      const response = await fetch(this.URL_POKTAN, {
        method: 'POST',
        headers: { 
            ...this.defaultHeaders,
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({
          cmbNegara: provinsiId,
          cmbProvinsi: kabupatenId,
          cmbKecamatan: kecamatanId,
        }),
      });

      const html = await response.text();
      console.log(`[DEBUG getPoktan] Status:`, response.status);

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
      
      if (poktanList.length === 0) console.log("[DEBUG getPoktan] HTML KOSONG:", html.substring(0, 300));

      return poktanList;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data Poktan');
    }
  }
}