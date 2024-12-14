import { Test } from '@nestjs/testing'
import { Logger, InternalServerErrorException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { of } from 'rxjs'

import { PaymentService } from './payment.service'
import { PaymentConnectorService } from './payment-connector.service'
import { PaymentStatusService } from './payment-status.service'
import { Payment3DSecureService } from './payment-3d-secure.service'
import { S2SPaymentStatus } from '../enums'
import { ProcessPaymentEvent } from '../events'
import { PaymentCurrency, InitiatePaymentDto, S2SPaymentPayloadDto, S2SPayment3DSecurePayloadDto } from '../dtos'

import { ProducerService } from '@modules/shared/services'
import { PurchaseService } from '@modules/purchase/services'
import { EventData } from '@modules/shared/models'

describe('PaymentService', () => {
  let service: PaymentService
  let loggerMock: PartiallyMocked<Logger>
  let producerServiceMock: PartiallyMocked<ProducerService>
  let paymentConnectorServiceMock: PartiallyMocked<PaymentConnectorService>
  let purchaseServiceMock: PartiallyMocked<PurchaseService>
  let paymentStatusServiceMock: PartiallyMocked<PaymentStatusService>
  let payment3DSecureServiceMock: PartiallyMocked<Payment3DSecureService>

  beforeEach(async () => {
    loggerMock = {
      error: vi.fn(),
    }

    producerServiceMock = {
      sendMessage: vi.fn(),
    }

    paymentConnectorServiceMock = {
      initiateS2SPayment: vi.fn(),
    }

    purchaseServiceMock = {
      createPurchase: vi.fn(),
    }

    paymentStatusServiceMock = {
      handlePaymentError: vi.fn(),
      handlePaymentExecuted: vi.fn(),
    }

    payment3DSecureServiceMock = {
      handleThreeDSecureRequired: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: Logger, useValue: loggerMock },
        { provide: ProducerService, useValue: producerServiceMock },
        { provide: PaymentConnectorService, useValue: paymentConnectorServiceMock },
        { provide: PurchaseService, useValue: purchaseServiceMock },
        { provide: PaymentStatusService, useValue: paymentStatusServiceMock },
        { provide: Payment3DSecureService, useValue: payment3DSecureServiceMock },
      ],
    }).compile()

    service = moduleRef.get(PaymentService)
  })

  describe('initiatePayment', () => {
    it('should create purchase and send process payment event', async () => {
      // Arrange
      const remoteIp = '127.0.0.1'
      const initiatePaymentDto: InitiatePaymentDto = {
        amount: 100,
        currency: PaymentCurrency.USD,
        cardholderName: 'John Doe',
        cardNumber: '4111111111111111',
        expires: '12/24',
        cvc: '123',
      }
      const purchase = {
        id: 'test-purchase-id',
        directPostUrl: 'http://test.com',
      }
      purchaseServiceMock.createPurchase?.mockResolvedValue(purchase)

      // Act
      const result = await service.initiatePayment(remoteIp, initiatePaymentDto)

      // Assert
      expect(purchaseServiceMock.createPurchase).toHaveBeenCalledWith({
        client: { email: 'test@test.com' },
        currency: 'USD',
        products: [{ name: 'Dynamic', price: 10000 }],
      })
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(expect.any(ProcessPaymentEvent))
      expect(result).toEqual({ purchaseId: purchase.id })
    })
  })

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const eventData: EventData<ProcessPaymentEvent> = {
        purchaseId: 'test-purchase-id',
        directPostUrl: 'http://test.com',
        cardholderName: 'John Doe',
        cardNumber: '4111111111111111',
        expires: '12/24',
        cvc: '123',
        remoteIp: '127.0.0.1',
      }
      const paymentResult: S2SPaymentPayloadDto = { status: S2SPaymentStatus.Executed }
      paymentConnectorServiceMock.initiateS2SPayment?.mockReturnValue(of(paymentResult))

      // Act
      await service.processPayment(eventData)

      // Assert
      expect(paymentConnectorServiceMock.initiateS2SPayment).toHaveBeenCalled()
      expect(paymentStatusServiceMock.handlePaymentExecuted).toHaveBeenCalledWith(eventData.purchaseId)
    })

    it('should handle payment error', async () => {
      // Arrange
      const eventData: EventData<ProcessPaymentEvent> = {
        purchaseId: 'test-purchase-id',
        directPostUrl: 'http://test.com',
        cardholderName: 'John Doe',
        cardNumber: '4111111111111111',
        expires: '12/24',
        cvc: '123',
        remoteIp: '127.0.0.1',
      }
      paymentConnectorServiceMock.initiateS2SPayment?.mockReturnValue(of({ status: S2SPaymentStatus.Error }))

      // Act
      await service.processPayment(eventData)

      // Assert
      expect(paymentStatusServiceMock.handlePaymentError).toHaveBeenCalledWith(eventData.purchaseId)
    })

    it('should throw InternalServerErrorException on payment processing error', async () => {
      // Arrange
      const eventData: EventData<ProcessPaymentEvent> = {
        purchaseId: 'test-purchase-id',
        directPostUrl: 'http://test.com',
        cardholderName: 'John Doe',
        cardNumber: '4111111111111111',
        expires: '12/24',
        cvc: '123',
        remoteIp: '127.0.0.1',
      }
      paymentConnectorServiceMock.initiateS2SPayment?.mockImplementation(() => {
        throw new Error('Payment failed')
      })

      // Act & Assert
      await expect(service.processPayment(eventData)).rejects.toThrow(InternalServerErrorException)
      expect(paymentStatusServiceMock.handlePaymentError).toHaveBeenCalledWith(eventData.purchaseId)
      expect(loggerMock.error).toHaveBeenCalled()
    })
  })

  describe('handlePaymentStatus', () => {
    it('should handle executed payment status', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const result: S2SPaymentPayloadDto = { status: S2SPaymentStatus.Executed }

      // Act
      await service.handlePaymentStatus(purchaseId, result)

      // Assert
      expect(paymentStatusServiceMock.handlePaymentExecuted).toHaveBeenCalledWith(purchaseId)
    })

    it('should handle error payment status', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const result: S2SPaymentPayloadDto = { status: S2SPaymentStatus.Error }

      // Act
      await service.handlePaymentStatus(purchaseId, result)

      // Assert
      expect(paymentStatusServiceMock.handlePaymentError).toHaveBeenCalledWith(purchaseId)
    })

    it('should handle 3D secure required status', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const result: S2SPayment3DSecurePayloadDto = {
        status: S2SPaymentStatus.ThreeDSecureRequired,
        Method: '3D Secure',
        PaReq: 'test-pa-req',
        URL: 'test-url',
        callback_url: 'test-callback-url',
      }

      // Act
      await service.handlePaymentStatus(purchaseId, result)

      // Assert
      expect(payment3DSecureServiceMock.handleThreeDSecureRequired).toHaveBeenCalledWith(purchaseId, result)
    })

    it('should not take action for pending status', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const result: S2SPaymentPayloadDto = { status: S2SPaymentStatus.Pending }

      // Act
      await service.handlePaymentStatus(purchaseId, result)

      // Assert
      expect(paymentStatusServiceMock.handlePaymentExecuted).not.toHaveBeenCalled()
      expect(paymentStatusServiceMock.handlePaymentError).not.toHaveBeenCalled()
      expect(payment3DSecureServiceMock.handleThreeDSecureRequired).not.toHaveBeenCalled()
    })
  })
})
