import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LanggraphGatewayModule } from './modules/langgraph-gateway/langgraph-gateway.module';

@Module({
  imports: [LanggraphGatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
