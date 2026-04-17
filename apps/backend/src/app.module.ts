import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LanggraphGatewayModule } from './modules/langgraph-gateway/langgraph-gateway.module';
import { TrpcModule } from './modules/trpc/trpc.module';

@Module({
  imports: [TrpcModule, LanggraphGatewayModule],
  controllers: [AppController],
})
export class AppModule {}
