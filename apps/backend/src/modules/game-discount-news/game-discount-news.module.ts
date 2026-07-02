import { Module } from '@nestjs/common';
import { GameDiscountEventsModule } from '../game-discount-events/game-discount-events.module';
import { GameDiscountNewsRepository } from './game-discount-news.repository';
import { GameDiscountNewsService } from './game-discount-news.service';

@Module({
  imports: [GameDiscountEventsModule],
  providers: [GameDiscountNewsRepository, GameDiscountNewsService],
  exports: [GameDiscountNewsService],
})
export class GameDiscountNewsModule {}
