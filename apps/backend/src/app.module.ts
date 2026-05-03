import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LanggraphGatewayModule } from './modules/langgraph-gateway/langgraph-gateway.module';
import { SteamMetadataModule } from './modules/steam-metadata/steam-metadata.module';
import { TrpcModule } from './modules/trpc/trpc.module';
import { TrpcPanelModule } from './modules/trpc-panel/trpc-panel.module';

@Module({
  imports: [
    TrpcModule,
    LanggraphGatewayModule,
    TrpcPanelModule,
    SteamMetadataModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
