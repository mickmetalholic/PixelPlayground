import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { LanggraphClientRepository } from '../src/modules/langgraph-gateway/langgraph-client.repository';

describe('LanggraphGatewayController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const repositoryMock: Pick<LanggraphClientRepository, 'invoke'> = {
      invoke: jest.fn().mockResolvedValue({
        sessionId: 'session-e2e',
        threadId: 'thread-e2e',
        requestId: 'request-e2e',
        message: 'hello from mocked upstream',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LanggraphClientRepository)
      .useValue(repositoryMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/langgraph/chat (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/langgraph/chat')
      .send({ message: 'hello' })
      .expect(201);

    expect(response.body).toEqual({
      sessionId: 'session-e2e',
      threadId: 'thread-e2e',
      requestId: 'request-e2e',
      message: 'hello from mocked upstream',
    });
  });
});
