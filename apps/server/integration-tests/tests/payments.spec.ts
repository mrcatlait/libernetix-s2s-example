import { Test } from '@nestjs/testing'
import request from 'supertest'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { HttpStatus } from '@nestjs/common'
import { Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'

import { ApiMocks } from '../mocks'

import { AppModule } from '@modules/app/app.module'
import { InitiatePaymentDto, PaymentCurrency } from '@modules/payment/dtos'
import { mongoContainer, rabbitMQContainer } from 'integration-tests/test-setup'
import { ThreeDSecureCallback } from '@modules/payment/schemas'

describe('Payments', () => {
  const apiUrl = 'https://gate.example.com'

  let app: NestExpressApplication
  const apiMock = new ApiMocks(apiUrl)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string): string | number => {
          switch (key) {
            case 'RMQ_URL':
              return rabbitMQContainer.getAmqpUrl()
            case 'API_URL':
              return apiUrl
            case 'MONGO_URI':
              return mongoContainer.getConnectionString() + '/?directConnection=true'
            default:
              return ''
          }
        },
      })
      .compile()

    apiMock.mockGetPublicKey(200, 'public-key')

    app = moduleRef.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await rabbitMQContainer.stop()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('/payments (POST)', () => {
    const path = '/payments'

    it('should create payment successfully', async () => {
      // Arrange
      const paymentData: InitiatePaymentDto = {
        amount: 100,
        currency: PaymentCurrency.EUR,
        cardholderName: 'John Doe',
        cardNumber: '1234567890',
        expires: '12/24',
        cvc: '123',
      }

      apiMock.mockCreatePurchase()

      // Act
      const response = await request(app.getHttpServer()).post(path).send(paymentData)

      // Assert
      expect(response.status).toBe(HttpStatus.CREATED)
      expect(response.body).toEqual({
        purchaseId: expect.any(String),
      })
    })

    it('should handle invalid payment data', async () => {
      // Arrange
      const invalidPaymentData: InitiatePaymentDto = {
        amount: -1,
        currency: PaymentCurrency.EUR,
        cardholderName: 'John Doe',
        cardNumber: '1234567890',
        expires: '12/24',
        cvc: '123',
      }

      apiMock.mockCreatePurchase()

      // Act
      const response = await request(app.getHttpServer()).post(path).send(invalidPaymentData)

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    })

    it.skip('should handle API errors gracefully', async () => {
      // Arrange
      const paymentData: InitiatePaymentDto = {
        amount: 100,
        currency: PaymentCurrency.EUR,
        cardholderName: 'John Doe',
        cardNumber: '1234567890',
        expires: '12/24',
        cvc: '123',
      }

      apiMock.mockCreatePurchase(500)

      // Act
      const response = await request(app.getHttpServer()).post(path).send(paymentData)

      // Assert
      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
