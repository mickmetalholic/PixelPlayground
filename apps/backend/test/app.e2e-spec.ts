import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ ok: true });
  });

  it('/trpc/home.summary (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/trpc/home.summary')
      .expect(200);

    expect(response.body).toEqual({
      result: {
        data: {
          json: {
            summary: 'Hello World!',
          },
        },
      },
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
