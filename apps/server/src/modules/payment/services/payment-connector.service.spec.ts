import { Test } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { AxiosError, AxiosRequestHeaders, AxiosResponse } from 'axios'
import { of, throwError } from 'rxjs'

import { PaymentConnectorService } from './payment-connector.service'
import { InitiateS2SPaymentDto, S2SPaymentPayloadDto, S2SPayment3DSecurePayloadDto } from '../dtos'
import { S2SPaymentStatus } from '../enums'

describe('PaymentConnectorService', () => {
  let service: PaymentConnectorService
  let httpServiceMock: PartiallyMocked<HttpService>
  let configServiceMock: PartiallyMocked<ConfigService>

  beforeEach(async () => {
    httpServiceMock = {
      post: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn().mockReturnValue('test-s2s-token'),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentConnectorService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile()

    service = moduleRef.get(PaymentConnectorService)
  })

  describe('initiateS2SPayment', () => {
    it('should successfully initiate S2S payment', () => {
      // Arrange
      const directPostUrl = 'http://test.com'
      const initiateS2SPaymentDto: InitiateS2SPaymentDto = {
        cardholder_name: 'John Doe',
        card_number: '1234567890',
        expires: '12/25',
        cvc: '123',
        remote_ip: '123.123.123.123',
      }
      const expectedResponse: S2SPaymentPayloadDto = {
        status: S2SPaymentStatus.Executed,
      }
      const axiosResponse: AxiosResponse = {
        data: expectedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      }

      httpServiceMock.post?.mockReturnValue(of(axiosResponse))

      // Act
      service.initiateS2SPayment(directPostUrl, initiateS2SPaymentDto).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(expectedResponse)
          expect(httpServiceMock.post).toHaveBeenCalledWith(`${directPostUrl}?s2s=true`, initiateS2SPaymentDto, {
            headers: {
              Authorization: 'Bearer test-s2s-token',
            },
          })
        },
      })
    })

    it('should handle 400 error with error status', () => {
      // Arrange
      const directPostUrl = 'http://test.com'
      const initiateS2SPaymentDto: InitiateS2SPaymentDto = {
        cardholder_name: 'John Doe',
        card_number: '1234567890',
        expires: '12/25',
        cvc: '123',
        remote_ip: '123.123.123.123',
      }
      const errorResponse: S2SPaymentPayloadDto = {
        status: S2SPaymentStatus.Error,
      }
      const axiosError = new AxiosError()
      axiosError.response = {
        data: errorResponse,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      }

      httpServiceMock.post?.mockReturnValue(throwError(() => axiosError))

      // Act
      service.initiateS2SPayment(directPostUrl, initiateS2SPaymentDto).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(errorResponse)
        },
      })
    })
  })

  describe('completeThreeDSecure', () => {
    it('should successfully complete 3D Secure', () => {
      // Arrange
      const payload = {
        callbackUrl: 'http://callback.com',
        MD: 'test-md',
        PaRes: 'test-pares',
      }
      const expectedResponse: S2SPaymentPayloadDto = {
        status: S2SPaymentStatus.Executed,
      }
      const axiosResponse: AxiosResponse = {
        data: expectedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      }

      httpServiceMock.post?.mockReturnValue(of(axiosResponse))

      // Act
      service.completeThreeDSecure(payload).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(expectedResponse)
          expect(httpServiceMock.post).toHaveBeenCalledWith(payload.callbackUrl, expect.any(String), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        },
      })
    })

    it('should handle 400 error with error status in 3D Secure completion', () => {
      // Arrange
      const payload = {
        callbackUrl: 'http://callback.com',
        MD: 'test-md',
        PaRes: 'test-pares',
      }
      const errorResponse: S2SPaymentPayloadDto = {
        status: S2SPaymentStatus.Error,
      }
      const axiosError = new AxiosError()
      axiosError.response = {
        data: errorResponse,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      }

      httpServiceMock.post?.mockReturnValue(throwError(() => axiosError))

      // Act
      service.completeThreeDSecure(payload).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(errorResponse)
        },
      })
    })

    it('should throw error for non-400 errors', () => {
      // Arrange
      const payload = {
        callbackUrl: 'http://callback.com',
        MD: 'test-md',
        PaRes: 'test-pares',
      }
      const axiosError = new AxiosError()
      axiosError.response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      }

      httpServiceMock.post?.mockReturnValue(throwError(() => axiosError))

      // Act
      service.completeThreeDSecure(payload).subscribe({
        error: (error) => {
          // Assert
          expect(error).toBeInstanceOf(AxiosError)
        },
      })
    })
  })
})
