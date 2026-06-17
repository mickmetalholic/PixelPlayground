import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LanggraphGatewayModule } from './modules/langgraph-gateway/langgraph-gateway.module';
import { TrpcModule } from './modules/trpc/trpc.module';
import { TrpcPanelModule } from './modules/trpc-panel/trpc-panel.module';

@Module({
  imports: [TrpcModule, LanggraphGatewayModule, TrpcPanelModule],
  controllers: [AppController],
})
export class AppModule {}
