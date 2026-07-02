import { Module } from '@nestjs/common';
import { SteamMetadataModule } from '../steam-metadata/steam-metadata.module';
import { GameDiscountEventsRepository } from './game-discount-events.repository';
import { GameDiscountEventsService } from './game-discount-events.service';

@Module({
  imports: [SteamMetadataModule],
  providers: [GameDiscountEventsRepository, GameDiscountEventsService],
  exports: [GameDiscountEventsService],
})
export class GameDiscountEventsModule {}
