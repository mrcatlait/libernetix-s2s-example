import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { of } from 'rxjs'
import { AxiosResponse } from 'axios'

import { PurchaseConnectorService } from './purchase-connector.service'
import { CreatePurchaseDto, PurchaseDto } from '../dto'
import { mapPurchaseDtoToModel } from '../mappers'

describe('PurchaseConnectorService', () => {
  let service: PurchaseConnectorService
  let httpServiceMock: PartiallyMocked<HttpService>

  const createPurchaseDto: CreatePurchaseDto = {
    client: { email: 'test@test.com' },
    purchase: {
      currency: 'USD',
      products: [{ name: 'test', price: 100 }],
    },
    success_redirect: 'http://localhost:3000/success',
    failure_redirect: 'http://localhost:3000/failure',
    brand_id: '123',
  }

  beforeEach(async () => {
    httpServiceMock = {
      post: vi.fn(),
      get: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [PurchaseConnectorService, { provide: HttpService, useValue: httpServiceMock }],
    }).compile()

    service = moduleRef.get(PurchaseConnectorService)
  })

  describe('createPurchase', () => {
    it('should create purchase and return mapped model', () => {
      // Arrange
      const purchaseDto: PurchaseDto = {
        id: '456',
        direct_post_url: 'http://localhost:3000/direct-post',
      }
      httpServiceMock.post?.mockReturnValue(of({ data: purchaseDto } as AxiosResponse))

      // Act
      service.createPurchase(createPurchaseDto).subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.post).toHaveBeenCalledWith('/purchases/', createPurchaseDto)
          expect(result).toEqual(mapPurchaseDtoToModel(purchaseDto))
        },
      })
    })
  })

  describe('getPurchase', () => {
    it('should get purchase by id and return mapped model', () => {
      // Arrange
      const purchaseId = '456'
      const purchaseDto: PurchaseDto = {
        id: '456',
        direct_post_url: 'http://localhost:3000/direct-post',
      }
      httpServiceMock.get?.mockReturnValue(of({ data: purchaseDto } as AxiosResponse))

      // Act
      service.getPurchase(purchaseId).subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.get).toHaveBeenCalledWith('/purchases/456/')
          expect(result).toEqual(mapPurchaseDtoToModel(purchaseDto))
        },
      })
    })
  })

  describe('cancelPurchase', () => {
    it('should cancel purchase and return mapped model', () => {
      // Arrange
      const purchaseId = '456'
      const purchaseDto: PurchaseDto = {
        id: '456',
        direct_post_url: 'http://localhost:3000/direct-post',
      }
      httpServiceMock.post?.mockReturnValue(of({ data: purchaseDto } as AxiosResponse))

      // Act
      service.cancelPurchase(purchaseId).subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.post).toHaveBeenCalledWith('/purchases/456/cancel/')
          expect(result).toEqual(mapPurchaseDtoToModel(purchaseDto))
        },
      })
    })
  })
})
