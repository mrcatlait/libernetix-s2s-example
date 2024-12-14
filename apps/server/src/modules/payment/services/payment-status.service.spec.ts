import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'

import { PaymentStatusService } from './payment-status.service'
import { PaymentStatus } from '../enums'
import { UpdatePaymentStatusEvent } from '../events'
import { ThreeDSecureRequestDto } from '../dtos'

import { ProducerService } from '@modules/shared/services'
import { TraceService } from '@modules/tracing/services'

describe('PaymentStatusService', () => {
  let service: PaymentStatusService
  let loggerMock: PartiallyMocked<Logger>
  let producerServiceMock: PartiallyMocked<ProducerService>
  let traceServiceMock: PartiallyMocked<TraceService>

  beforeEach(async () => {
    loggerMock = {
      error: vi.fn(),
      log: vi.fn(),
    }

    producerServiceMock = {
      sendMessage: vi.fn().mockResolvedValue(undefined),
    }

    traceServiceMock = {
      startActiveSpan: vi.fn().mockImplementation((title: string, cb: () => Promise<unknown>) => cb()),
      addMetadata: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentStatusService,
        { provide: Logger, useValue: loggerMock },
        { provide: ProducerService, useValue: producerServiceMock },
        { provide: TraceService, useValue: traceServiceMock },
      ],
    }).compile()

    service = moduleRef.get(PaymentStatusService)
  })

  describe('handlePaymentError', () => {
    it('should log error and send failed payment status event', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const expectedEvent = new UpdatePaymentStatusEvent({
        data: {
          purchaseId,
          status: PaymentStatus.Failed,
        },
      })

      // Act
      await service.handlePaymentError(purchaseId)

      // Assert
      expect(loggerMock.error).toHaveBeenCalledWith(`Payment failed for purchase ${purchaseId}`)
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(expectedEvent)
      expect(traceServiceMock.addMetadata).toHaveBeenCalledWith({
        purchaseId,
        status: PaymentStatus.Failed,
      })
    })
  })

  describe('handlePaymentExecuted', () => {
    it('should log success and send executed payment status event', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const expectedEvent = new UpdatePaymentStatusEvent({
        data: {
          purchaseId,
          status: PaymentStatus.Executed,
        },
      })

      // Act
      await service.handlePaymentExecuted(purchaseId)

      // Assert
      expect(loggerMock.log).toHaveBeenCalledWith(`Payment executed for purchase ${purchaseId}`)
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(expectedEvent)
      expect(traceServiceMock.addMetadata).toHaveBeenCalledWith({
        purchaseId,
        status: PaymentStatus.Executed,
      })
    })
  })

  describe('handleThreeDSecureRequired', () => {
    it('should log 3DS requirement and send 3DS required status event with GET method', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const threeDSecureRequest: ThreeDSecureRequestDto = {
        method: 'GET',
        url: 'https://test.com',
      }
      const expectedEvent = new UpdatePaymentStatusEvent({
        data: {
          purchaseId,
          status: PaymentStatus.ThreeDSecureRequired,
          threeDSecureRequest,
        },
      })

      // Act
      await service.handleThreeDSecureRequired(purchaseId, threeDSecureRequest)

      // Assert
      expect(loggerMock.log).toHaveBeenCalledWith(`ThreeDSecure required for purchase ${purchaseId}`)
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(expectedEvent)
      expect(traceServiceMock.addMetadata).toHaveBeenCalledWith({
        purchaseId,
        status: PaymentStatus.ThreeDSecureRequired,
      })
    })

    it('should log 3DS requirement and send 3DS required status event with POST method', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const threeDSecureRequest: ThreeDSecureRequestDto = {
        method: 'POST',
        url: 'https://test.com',
        body: {
          MD: 'test-md',
          PaReq: 'test-pareq',
          TermUrl: 'https://test.com',
        },
      }

      const expectedEvent = new UpdatePaymentStatusEvent({
        data: {
          purchaseId,
          status: PaymentStatus.ThreeDSecureRequired,
          threeDSecureRequest,
        },
      })

      // Act
      await service.handleThreeDSecureRequired(purchaseId, threeDSecureRequest)

      // Assert
      expect(loggerMock.log).toHaveBeenCalledWith(`ThreeDSecure required for purchase ${purchaseId}`)
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(expectedEvent)
      expect(traceServiceMock.addMetadata).toHaveBeenCalledWith({
        purchaseId,
        status: PaymentStatus.ThreeDSecureRequired,
      })
    })
  })
})
