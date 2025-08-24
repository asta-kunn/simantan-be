import { Module } from '@nestjs/common';
import { WilayahService } from './wilayah.service';
import { WilayahController } from './wilayah.controller';

@Module({
  controllers: [WilayahController],
  providers: [WilayahService],
})
export class WilayahModule {}


