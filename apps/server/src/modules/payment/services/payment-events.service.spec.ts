import { Test } from '@nestjs/testing'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'

import { PaymentEventsService } from './payment-events.service'
import { UpdatePaymentStatusEvent } from '../events'
import { PaymentStatus } from '../enums'

import { EventData } from '@modules/shared/models'

describe('PaymentEventsService', () => {
  let service: PaymentEventsService
  let eventEmitterMock: PartiallyMocked<EventEmitter2>

  beforeEach(async () => {
    eventEmitterMock = {
      emit: vi.fn(),
      on: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [PaymentEventsService, { provide: EventEmitter2, useValue: eventEmitterMock }],
    }).compile()

    service = moduleRef.get<PaymentEventsService>(PaymentEventsService)
  })

  describe('emitPaymentStatus', () => {
    it('should emit payment status event', () => {
      // Arrange
      const data: EventData<UpdatePaymentStatusEvent> = {
        purchaseId: '123',
        status: PaymentStatus.Executed,
      }

      // Act
      service.emitPaymentStatus(data)

      // Assert
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('payment.status.123', data)
    })
  })
})
