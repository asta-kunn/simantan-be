import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WilayahService } from './wilayah.service';
import { WilayahController } from './wilayah.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600000, // Set cache 1 jam (dalam milidetik)
    }),
  ],
  controllers: [WilayahController],
  providers: [WilayahService],
})
export class WilayahModule {}