import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { ClientProxy, ClientProxyFactory, RmqRecordBuilder } from '@nestjs/microservices'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { firstValueFrom, of } from 'rxjs'

import { ProducerService } from './producer.service'
import { AbstractEvent } from '../classes'

// Mock implementation of AbstractEvent
class TestEvent extends AbstractEvent<{ test: string }> {
  pattern = 'test-pattern'
  constructor() {
    super({ data: { test: 'test' } })
  }
}

describe('ProducerService', () => {
  vi.mock('@nestjs/microservices', async () => {
    const actual = await vi.importActual('@nestjs/microservices')
    return {
      ...actual,
      ClientProxyFactory: {
        create: vi.fn().mockReturnValue({
          connect: vi.fn().mockResolvedValue(undefined),
          emit: vi.fn(),
        }),
      },
    }
  })

  let service: ProducerService
  let configServiceMock: PartiallyMocked<ConfigService>
  let clientProxyMock: PartiallyMocked<ClientProxy>

  beforeEach(async () => {
    clientProxyMock = {
      connect: vi.fn().mockResolvedValue(undefined),
      emit: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn().mockReturnValue('amqp://localhost:5672'),
    }

    vi.mocked(ClientProxyFactory.create).mockReturnValue(clientProxyMock as unknown as ClientProxy)

    const moduleRef = await Test.createTestingModule({
      providers: [ProducerService, { provide: ConfigService, useValue: configServiceMock }],
    }).compile()

    service = moduleRef.get(ProducerService)
    // @ts-expect-error - private property
    service.client = clientProxyMock
  })

  describe('onApplicationBootstrap', () => {
    it('should connect to the client on bootstrap', async () => {
      // Act
      await service.onApplicationBootstrap()

      // Assert
      expect(clientProxyMock.connect).toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    it('should emit event with correct pattern and data', async () => {
      // Arrange
      const testEvent = new TestEvent()
      const record = new RmqRecordBuilder(testEvent.data).build()
      clientProxyMock.emit?.mockReturnValue(of(undefined))

      // Act
      await service.sendMessage(testEvent)

      // Assert
      expect(clientProxyMock.emit).toHaveBeenCalledWith(testEvent.pattern, record)
    })

    it('should return a promise that resolves when emission is complete', async () => {
      // Arrange
      const testEvent = new TestEvent()
      clientProxyMock.emit?.mockReturnValue(of(undefined))

      // Act
      const result = service.sendMessage(testEvent)

      // Assert
      await expect(result).resolves.toBeUndefined()
    })
  })

  describe('sendMessageObservable', () => {
    it('should emit event and return observable', () => {
      // Arrange
      const testEvent = new TestEvent()
      const record = new RmqRecordBuilder(testEvent.data).build()
      clientProxyMock.emit?.mockReturnValue(of(undefined))

      // Act
      const result = service.sendMessageObservable(testEvent)

      // Assert
      expect(clientProxyMock.emit).toHaveBeenCalledWith(testEvent.pattern, record)
      expect(result).toBeDefined()
    })

    it('should return the same observable as client.emit', async () => {
      // Arrange
      const testEvent = new TestEvent()
      const expectedResult = of(undefined)
      clientProxyMock.emit?.mockReturnValue(expectedResult)

      // Act
      const result = service.sendMessageObservable(testEvent)

      // Assert
      expect(await firstValueFrom(result)).toBeUndefined()
    })
  })
})
