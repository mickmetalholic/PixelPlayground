import { Injectable, NotFoundException } from '@nestjs/common';
import { renderTrpcPanel } from 'trpc-panel';
import { appRouter } from '../trpc/trpc.router';
import { resolveTrpcPanelConfig } from './trpc-panel.config';

type RenderPanelInput = Readonly<{
  origin: string;
  env?: NodeJS.ProcessEnv;
}>;

@Injectable()
export class TrpcPanelService {
  render(input: RenderPanelInput): string {
    const config = resolveTrpcPanelConfig(input.env ?? process.env);
    if (!config.enabled) {
      throw new NotFoundException();
    }

    // Explicit URL override keeps the panel stable behind proxies.
    const url = config.trpcUrl ?? `${input.origin}/trpc`;

    return renderTrpcPanel(appRouter as never, {
      url,
      transformer: 'superjson',
    });
  }
}
