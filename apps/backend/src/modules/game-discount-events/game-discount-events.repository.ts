import { Injectable } from '@nestjs/common';
import {
  getAllDiscountEvents,
  type GameDiscountEvent,
} from '@pixel-playground/api';

@Injectable()
export class GameDiscountEventsRepository {
  list(): GameDiscountEvent[] {
    return getAllDiscountEvents();
  }

  findById(id: string): GameDiscountEvent | undefined {
    return this.list().find((event) => event.id === id);
  }
}
