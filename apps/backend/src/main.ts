import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envSchema } from './config/env.schema';

async function bootstrap() {
  const env = envSchema.parse(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
}
bootstrap();
