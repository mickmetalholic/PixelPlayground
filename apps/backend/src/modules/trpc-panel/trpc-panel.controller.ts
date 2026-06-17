import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TrpcPanelService } from './trpc-panel.service';

@Controller()
export class TrpcPanelController {
  constructor(
    @Inject(TrpcPanelService)
    private readonly trpcPanelService: TrpcPanelService,
  ) {}

  @Get('/trpc-panel')
  getPanel(@Req() req: Request, @Res() res: Response): void {
    const host = req.get('host');
    const origin = `${req.protocol}://${host ?? 'localhost'}`;
    const html = this.trpcPanelService.render({ origin });
    res.type('text/html').send(html);
  }
}
