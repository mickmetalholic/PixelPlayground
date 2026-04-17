import { Module } from '@nestjs/common';
import { LanggraphClientRepository } from './langgraph-client.repository';
import { LanggraphGatewayController } from './langgraph-gateway.controller';
import { LanggraphGatewayService } from './langgraph-gateway.service';
import { SessionIndexRepository } from './session-index.repository';

@Module({
  controllers: [LanggraphGatewayController],
  providers: [
    LanggraphGatewayService,
    LanggraphClientRepository,
    SessionIndexRepository,
  ],
})
export class LanggraphGatewayModule {}
