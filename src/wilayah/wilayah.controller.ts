import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { WilayahService } from './wilayah.service';

@Controller('wilayah')
@UseInterceptors(CacheInterceptor)
export class WilayahController {
  constructor(private readonly wilayahService: WilayahService) {}

  @Get('provinsi')
  async getProvinsi() {
    return this.wilayahService.getProvinsi();
  }

  @Get('kabupaten/:provinsiId')
  async getKabupaten(@Param('provinsiId') provinsiId: string) {
    return this.wilayahService.getKabupaten(provinsiId);
  }

  @Get('kecamatan/:kabupatenId')
  async getKecamatan(@Param('kabupatenId') kabupatenId: string) {
    return this.wilayahService.getKecamatan(kabupatenId);
  }

  @Get('poktan/:provinsiId/:kabupatenId/:kecamatanId')
  async getPoktan(
    @Param('provinsiId') provinsiId: string,
    @Param('kabupatenId') kabupatenId: string,
    @Param('kecamatanId') kecamatanId: string,
  ) {
    return this.wilayahService.getPoktan(provinsiId, kabupatenId, kecamatanId);
  }
}