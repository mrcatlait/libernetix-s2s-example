import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { of } from 'rxjs'
import { Model } from 'mongoose'

import { Payment3DSecureService } from './payment-3d-secure.service'
import { PaymentStatusService } from './payment-status.service'
import { PaymentConnectorService } from './payment-connector.service'
import { PaymentService } from './payment.service'
import { ThreeDSecureCallback } from '../schemas'
import { CALLBACK_EXPIRATION_TIME } from '../constants'
import { S2SPaymentStatus } from '../enums'
import { S2SPayment3DSecurePayloadDto, S2SPaymentPayloadDto } from '../dtos'

describe('Payment3DSecureService', () => {
  let service: Payment3DSecureService
  let paymentStatusServiceMock: PartiallyMocked<PaymentStatusService>
  let configServiceMock: PartiallyMocked<ConfigService>
  let paymentConnectorServiceMock: PartiallyMocked<PaymentConnectorService>
  let paymentServiceMock: PartiallyMocked<PaymentService>
  let threeDSecureCallbackModelMock: PartiallyMocked<Model<ThreeDSecureCallback>>

  beforeEach(async () => {
    paymentStatusServiceMock = {
      handleThreeDSecureRequired: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn().mockReturnValue('http://localhost:3000'),
    }

    paymentConnectorServiceMock = {
      completeThreeDSecure: vi.fn(),
    }

    paymentServiceMock = {
      handlePaymentStatus: vi.fn(),
    }

    threeDSecureCallbackModelMock = {
      create: vi.fn(),
      findOne: vi.fn(),
      deleteOne: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        Payment3DSecureService,
        { provide: PaymentStatusService, useValue: paymentStatusServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PaymentConnectorService, useValue: paymentConnectorServiceMock },
        { provide: PaymentService, useValue: paymentServiceMock },
        {
          provide: getModelToken(ThreeDSecureCallback.name),
          useValue: threeDSecureCallbackModelMock,
        },
      ],
    }).compile()

    service = moduleRef.get(Payment3DSecureService)
  })

  describe('handleThreeDSecureRequired', () => {
    it('should create callback and handle 3DS required', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const s2sPaymentPayload: S2SPayment3DSecurePayloadDto = {
        callback_url: 'http://callback.com',
        URL: 'http://test.com',
        Method: 'POST',
        MD: 'test-md',
        status: S2SPaymentStatus.ThreeDSecureRequired,
        PaReq: 'test-pareq',
      }

      // Act
      await service.handleThreeDSecureRequired(purchaseId, s2sPaymentPayload)

      // Assert
      expect(threeDSecureCallbackModelMock.create).toHaveBeenCalledWith({
        purchaseId,
        callbackUrl: s2sPaymentPayload.callback_url,
        createdAt: expect.any(Date),
      })
      expect(paymentStatusServiceMock.handleThreeDSecureRequired).toHaveBeenCalled()
    })
  })

  describe('handleThreeDSecureCallback', () => {
    it('should throw NotFoundException when callback not found', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const callback = { MD: 'test-md', PaRes: 'test-pares' }
      threeDSecureCallbackModelMock.findOne?.mockResolvedValue(null)

      // Act & Assert
      await expect(service.handleThreeDSecureCallback(purchaseId, callback)).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when callback expired', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const callback = { MD: 'test-md', PaRes: 'test-pares' }
      const expiredDate = new Date(Date.now() - CALLBACK_EXPIRATION_TIME - 1000)
      threeDSecureCallbackModelMock.findOne?.mockResolvedValue({
        callbackUrl: 'http://callback.com',
        createdAt: expiredDate,
      })

      // Act & Assert
      await expect(service.handleThreeDSecureCallback(purchaseId, callback)).rejects.toThrow(BadRequestException)
    })

    it('should complete 3DS and handle payment status', async () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const callback = { MD: 'test-md', PaRes: 'test-pares' }
      const callbackData = {
        callbackUrl: 'http://callback.com',
        createdAt: new Date(),
      }
      const paymentResponse: S2SPaymentPayloadDto = { status: S2SPaymentStatus.Executed }

      threeDSecureCallbackModelMock.findOne?.mockResolvedValue(callbackData)
      paymentConnectorServiceMock.completeThreeDSecure?.mockReturnValue(of(paymentResponse))

      // Act
      await service.handleThreeDSecureCallback(purchaseId, callback)

      // Assert
      expect(paymentConnectorServiceMock.completeThreeDSecure).toHaveBeenCalledWith({
        callbackUrl: callbackData.callbackUrl,
        MD: callback.MD,
        PaRes: callback.PaRes,
      })
      expect(threeDSecureCallbackModelMock.deleteOne).toHaveBeenCalledWith({ purchaseId })
      expect(paymentServiceMock.handlePaymentStatus).toHaveBeenCalledWith(purchaseId, paymentResponse)
    })
  })

  describe('buildThreeDSecureRequest', () => {
    it('should build GET request correctly', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const payload: S2SPayment3DSecurePayloadDto = {
        URL: 'http://test.com',
        Method: 'GET',
        MD: 'test-md',
        PaReq: 'test-pareq',
        callback_url: 'http://callback.com',
        status: S2SPaymentStatus.ThreeDSecureRequired,
      }

      // Act
      const result = service.buildThreeDSecureRequest(purchaseId, payload)

      // Assert
      expect(result.method).toBe('GET')
      expect(result.url).toContain('MD=test-md')
      expect(result.url).toContain('PaReq=test-pareq')
      expect(result.url).toContain(
        `TermUrl=${encodeURIComponent('http://localhost:3000/payments/test-purchase-id/callback')}`,
      )
    })

    it('should build POST request correctly', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const payload: S2SPayment3DSecurePayloadDto = {
        URL: 'http://test.com',
        Method: 'POST',
        MD: 'test-md',
        PaReq: 'test-pareq',
        callback_url: 'http://callback.com',
        status: S2SPaymentStatus.ThreeDSecureRequired,
      }

      // Act
      const result = service.buildThreeDSecureRequest(purchaseId, payload)

      // Assert
      expect(result.method).toBe('POST')
      expect(result.url).toBe('http://test.com/')
      expect(result.body).toEqual({
        MD: 'test-md',
        PaReq: 'test-pareq',
        TermUrl: 'http://localhost:3000/payments/test-purchase-id/callback',
      })
    })

    it('should throw InternalServerErrorException for invalid method', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const payload: S2SPayment3DSecurePayloadDto = {
        URL: 'http://test.com',
        Method: 'PUT',
        MD: 'test-md',
        PaReq: 'test-pareq',
        callback_url: 'http://callback.com',
        status: S2SPaymentStatus.ThreeDSecureRequired,
      }

      // Act & Assert
      expect(() => service.buildThreeDSecureRequest(purchaseId, payload)).toThrow('Invalid 3D Secure response')
    })
  })
})
