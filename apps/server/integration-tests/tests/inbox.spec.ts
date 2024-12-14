import { Test } from '@nestjs/testing'
import request from 'supertest'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { HttpStatus } from '@nestjs/common'

import { ApiMocks, SignatureMock } from '../mocks'

import { AppModule } from '@modules/app/app.module'
import { PurchaseDto } from '@modules/purchase/dto'
import { mongoContainer, rabbitMQContainer } from 'integration-tests/test-setup'

describe('Inbox', () => {
  const apiUrl = 'https://gate.example.com'

  let app: NestExpressApplication

  const apiMock = new ApiMocks(apiUrl)
  const signatureMock = new SignatureMock()

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

    app = moduleRef.createNestApplication()
    apiMock.mockGetPublicKey(200, signatureMock.getPublicKey())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await rabbitMQContainer.stop()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('/inbox/purchase-paid (POST)', () => {
    const path = '/inbox/purchase-paid'

    it('should handle purchase paid successfully', async () => {
      // Arrange
      const purchaseData: PurchaseDto = {
        id: '123',
        direct_post_url: 'http://api.example.com/pay',
      }

      const base64Signature = signatureMock.base64Signature(purchaseData)

      // Act
      const response = await request(app.getHttpServer())
        .post(path)
        .set('X-Signature', base64Signature)
        .send(purchaseData)

      // Assert
      expect(response.status).toBe(HttpStatus.CREATED)
    })

    it('should reject request with invalid signature', async () => {
      // Arrange
      const purchaseData: PurchaseDto = {
        id: '123',
        direct_post_url: 'http://api.example.com/pay',
      }
      const invalidSignature = 'invalid-signature'

      // Act
      const response = await request(app.getHttpServer())
        .post(path)
        .set('X-Signature', invalidSignature)
        .send(purchaseData)

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('should reject request with missing signature header', async () => {
      // Arrange
      const purchaseData: PurchaseDto = {
        id: '123',
        direct_post_url: 'http://api.example.com/pay',
      }

      // Act
      const response = await request(app.getHttpServer()).post(path).send(purchaseData)

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('should reject request with invalid purchase data', async () => {
      // Arrange
      const purchaseData = {
        invalidField: 'invalidValue',
      }

      const base64Signature = signatureMock.base64Signature(purchaseData)

      // Act
      const response = await request(app.getHttpServer())
        .post(path)
        .set('X-Signature', base64Signature)
        .send(purchaseData)

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    })
  })
})
