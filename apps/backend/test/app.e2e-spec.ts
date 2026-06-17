import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };
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

  it('/trpc-panel (GET) returns html when enabled', async () => {
    const response = await request(app.getHttpServer())
      .get('/trpc-panel')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
  });

  it('/trpc-panel (GET) returns 404 when disabled by env override', async () => {
    process.env.TRPC_PANEL_ENABLED = 'false';

    await request(app.getHttpServer()).get('/trpc-panel').expect(404);
  });

  afterEach(async () => {
    await app.close();
    process.env = originalEnv;
  });
});
