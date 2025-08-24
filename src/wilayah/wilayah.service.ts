import { Injectable } from '@nestjs/common';

@Injectable()
export class WilayahService {
  private readonly DISTRICTS_URL = 'https://wilayah.id/api/districts/32.01.json';
  private readonly VILLAGES_URL = (districtCode: string) => `https://wilayah.id/api/villages/${districtCode}.json`;

  async getDistricts() {
    const res = await fetch(this.DISTRICTS_URL);
    const json = await res.json();
    return json;
  }

  async getVillages(districtCode: string) {
    const res = await fetch(this.VILLAGES_URL(districtCode));
    const json = await res.json();
    return json;
  }
}


