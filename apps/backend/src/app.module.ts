import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [TrpcModule],
  controllers: [AppController],
})
export class AppModule {}
