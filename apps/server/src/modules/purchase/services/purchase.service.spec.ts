import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { of, throwError } from 'rxjs'

import { PurchaseService } from './purchase.service'
import { PurchaseConnectorService } from './purchase-connector.service'
import { Purchase } from '../models'

describe('PurchaseService', () => {
  let service: PurchaseService
  let purchaseConnectorServiceMock: PartiallyMocked<PurchaseConnectorService>
  let configServiceMock: PartiallyMocked<ConfigService>

  const mockPurchaseData = {
    client: { email: 'test@example.com' },
    currency: 'USD',
    products: [{ name: 'Test Product', price: 100 }],
  }

  const mockConfig = {
    BRAND_ID: 'test-brand',
    UI_URL: 'http://localhost:4200',
  }

  beforeEach(async () => {
    purchaseConnectorServiceMock = {
      createPurchase: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn((key: string) => mockConfig[key]),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        PurchaseService,
        { provide: Logger, useValue: { log: vi.fn(), error: vi.fn() } },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PurchaseConnectorService, useValue: purchaseConnectorServiceMock },
      ],
    }).compile()

    service = moduleRef.get(PurchaseService)
  })

  describe('createPurchase', () => {
    it('should successfully create a purchase', async () => {
      // Arrange
      const mockPurchaseResponse: Purchase = {
        id: 'purchase-123',
        directPostUrl: 'http://payment.url',
      }
      purchaseConnectorServiceMock.createPurchase?.mockReturnValue(of(mockPurchaseResponse))

      // Act
      const result = await service.createPurchase(mockPurchaseData)

      // Assert
      expect(result).toEqual(mockPurchaseResponse)
      expect(purchaseConnectorServiceMock.createPurchase).toHaveBeenCalledWith({
        client: { email: mockPurchaseData.client.email },
        purchase: {
          currency: mockPurchaseData.currency,
          products: mockPurchaseData.products,
        },
        brand_id: mockConfig.BRAND_ID,
        success_redirect: `${mockConfig.UI_URL}/success`,
        failure_redirect: `${mockConfig.UI_URL}/failure`,
      })
    })

    it('should throw InternalServerErrorException when purchase creation fails', async () => {
      // Arrange
      purchaseConnectorServiceMock.createPurchase?.mockReturnValue(throwError(() => new Error('Connection failed')))

      // Act & Assert
      await expect(service.createPurchase(mockPurchaseData)).rejects.toThrow('Internal Server Error')
    })
  })
})
