import type { AppContext } from '@pixel-playground/api';
import type { AppService } from '../../app.service';

export const createNestTrpcContext =
  (appService: AppService) => async (): Promise<AppContext> => ({
    services: {
      home: {
        getSummary: async () => appService.getHello(),
      },
    },
  });
