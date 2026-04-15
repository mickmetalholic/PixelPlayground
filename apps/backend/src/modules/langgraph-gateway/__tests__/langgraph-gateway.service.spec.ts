import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { LanggraphClientRepository } from '../langgraph-client.repository';
import { LanggraphGatewayService } from '../langgraph-gateway.service';
import { SessionIndexRepository } from '../session-index.repository';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('LanggraphGatewayService', () => {
  it('creates a stable sessionId and forwards requestId to repository', async () => {
    const repository = {
      invoke: jest.fn().mockResolvedValue({
        sessionId: 'session-1',
        threadId: 'thread-1',
        requestId: 'request-1',
        message: 'ok',
      }),
    };
    const sessionIndex = {
      getThreadId: jest.fn().mockResolvedValue(null),
      saveThreadId: jest.fn().mockResolvedValue(undefined),
      getResponseByRequestId: jest.fn().mockResolvedValue(null),
      saveResponseByRequestId: jest.fn().mockResolvedValue(undefined),
    };

    const randomUUIDMock = jest.mocked(randomUUID);
    randomUUIDMock
      .mockReturnValueOnce('session-1')
      .mockReturnValueOnce('request-1');

    const moduleRef = await Test.createTestingModule({
      providers: [
        LanggraphGatewayService,
        {
          provide: LanggraphClientRepository,
          useValue: repository,
        },
        {
          provide: SessionIndexRepository,
          useValue: sessionIndex,
        },
      ],
    }).compile();

    const service = moduleRef.get(LanggraphGatewayService);
    const output = await service.chat({ message: 'hello' });

    expect(output.sessionId).toBe('session-1');
    expect(repository.invoke).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        requestId: 'request-1',
        message: 'hello',
      }),
    );
    expect(sessionIndex.saveThreadId).toHaveBeenCalledWith(
      'session-1',
      'thread-1',
    );
    expect(sessionIndex.saveResponseByRequestId).toHaveBeenCalled();
  });

  it('reuses thread mapping when same sessionId is provided', async () => {
    const repository = {
      invoke: jest.fn().mockResolvedValue({
        sessionId: 'session-1',
        threadId: 'thread-1',
        requestId: 'request-1',
        message: 'ok',
      }),
    };
    const sessionIndex = {
      getThreadId: jest.fn().mockResolvedValue('thread-1'),
      saveThreadId: jest.fn().mockResolvedValue(undefined),
      getResponseByRequestId: jest.fn().mockResolvedValue(null),
      saveResponseByRequestId: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LanggraphGatewayService,
        {
          provide: LanggraphClientRepository,
          useValue: repository,
        },
        {
          provide: SessionIndexRepository,
          useValue: sessionIndex,
        },
      ],
    }).compile();

    const service = moduleRef.get(LanggraphGatewayService);
    await service.chat({ sessionId: 'session-1', message: 'resume' });

    expect(repository.invoke).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-1',
      }),
    );
  });

  it('returns cached response when requestId already exists', async () => {
    const repository = {
      invoke: jest.fn(),
    };
    const cachedResponse = {
      sessionId: 'session-1',
      threadId: 'thread-1',
      requestId: 'request-1',
      message: 'cached',
    };
    const sessionIndex = {
      getThreadId: jest.fn().mockResolvedValue('thread-1'),
      saveThreadId: jest.fn().mockResolvedValue(undefined),
      getResponseByRequestId: jest.fn().mockResolvedValue(cachedResponse),
      saveResponseByRequestId: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LanggraphGatewayService,
        {
          provide: LanggraphClientRepository,
          useValue: repository,
        },
        {
          provide: SessionIndexRepository,
          useValue: sessionIndex,
        },
      ],
    }).compile();

    const service = moduleRef.get(LanggraphGatewayService);
    const response = await service.chat({
      sessionId: 'session-1',
      requestId: 'request-1',
      message: 'hello',
    });

    expect(response).toEqual(cachedResponse);
    expect(repository.invoke).not.toHaveBeenCalled();
  });
});
