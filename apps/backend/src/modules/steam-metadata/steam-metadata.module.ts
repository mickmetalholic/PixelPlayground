import { Module, type OnModuleInit } from '@nestjs/common';
import { SteamAppdetailsClient } from './steam-appdetails.client';
import { SteamMetadataController } from './steam-metadata.controller';
import { SteamMetadataNormalizer } from './steam-metadata.normalizer';
import { SteamMetadataRepository } from './steam-metadata.repository';
import { mockGameRecords } from './steam-metadata.seed';
import { SteamMetadataService } from './steam-metadata.service';

@Module({
  controllers: [SteamMetadataController],
  providers: [
    SteamMetadataRepository,
    SteamMetadataService,
    SteamAppdetailsClient,
    SteamMetadataNormalizer,
  ],
  exports: [SteamMetadataService, SteamMetadataRepository],
})
export class SteamMetadataModule implements OnModuleInit {
  constructor(private readonly repository: SteamMetadataRepository) {}

  onModuleInit() {
    this.repository.seed(mockGameRecords);
  }
}
