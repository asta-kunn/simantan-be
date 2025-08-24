import { Controller, Get, Param } from '@nestjs/common';
import { WilayahService } from './wilayah.service';

@Controller('wilayah')
export class WilayahController {
  constructor(private readonly wilayahService: WilayahService) {}

  @Get('districts')
  async getDistricts() {
    return this.wilayahService.getDistricts();
  }

  @Get('villages/:districtCode')
  async getVillages(@Param('districtCode') districtCode: string) {
    return this.wilayahService.getVillages(districtCode);
  }
}


