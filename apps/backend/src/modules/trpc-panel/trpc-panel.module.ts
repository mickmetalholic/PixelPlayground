import { Module } from '@nestjs/common';
import { TrpcPanelController } from './trpc-panel.controller';
import { TrpcPanelService } from './trpc-panel.service';

@Module({
  controllers: [TrpcPanelController],
  providers: [TrpcPanelService],
})
export class TrpcPanelModule {}
