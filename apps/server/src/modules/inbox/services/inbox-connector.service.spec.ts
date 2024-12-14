import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { of } from 'rxjs'
import { AxiosResponse } from 'axios'

import { InboxConnectorService } from './inbox-connector.service'
import { CreateWebhookDto, WebhookPayloadDto } from '../dtos'
import { WebhookEvent } from '../enums'

describe('InboxConnectorService', () => {
  let service: InboxConnectorService
  let httpServiceMock: PartiallyMocked<HttpService>

  const createWebhookDto: CreateWebhookDto = {
    title: 'test-title',
    all_events: true,
    events: [WebhookEvent.PurchasePaid, WebhookEvent.PurchaseFailed],
    callback: 'https://test.com',
  }

  beforeEach(async () => {
    httpServiceMock = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [InboxConnectorService, { provide: HttpService, useValue: httpServiceMock }],
    }).compile()

    service = moduleRef.get(InboxConnectorService)
  })

  describe('createWebhook', () => {
    it('should successfully create a webhook and return webhook payload', () => {
      // Arrange
      const webhookPayload: WebhookPayloadDto = {
        type: 'test-type',
        id: 'test-id',
        created_on: 1234567890,
        public_key: 'test-public-key',
        updated_on: 1234567890,
        title: 'test-title',
        all_events: true,
        events: [WebhookEvent.PurchasePaid, WebhookEvent.PurchaseFailed],
        callback: 'https://test.com',
      }
      httpServiceMock.post?.mockReturnValue(of({ data: webhookPayload } as AxiosResponse))

      // Act
      service.createWebhook(createWebhookDto).subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.post).toHaveBeenCalledWith('/webhooks/', createWebhookDto)
          expect(result).toEqual(webhookPayload)
        },
      })
    })
  })

  describe('getWebhooks', () => {
    it('should successfully retrieve webhooks', () => {
      // Arrange
      const webhooks: WebhookPayloadDto[] = [
        // Add mock webhooks based on your DTO structure
      ]
      httpServiceMock.get?.mockReturnValue(of({ data: { results: webhooks } } as AxiosResponse))

      // Act
      service.getWebhooks().subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.get).toHaveBeenCalledWith('/webhooks/')
          expect(result).toEqual(webhooks)
        },
      })
    })
  })

  describe('deleteWebhook', () => {
    it('should successfully delete a webhook', () => {
      // Arrange
      const webhookId = 'test-id'
      httpServiceMock.delete?.mockReturnValue(of({ data: {} } as AxiosResponse))

      // Act
      service.deleteWebhook(webhookId).subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.delete).toHaveBeenCalledWith(`/webhooks/${webhookId}/`)
          expect(result).toEqual({})
        },
      })
    })
  })

  describe('getPublicKey', () => {
    it('should successfully retrieve public key', () => {
      // Arrange
      const publicKey = 'mock-public-key'
      httpServiceMock.get?.mockReturnValue(of({ data: publicKey } as AxiosResponse))

      // Act
      service.getPublicKey().subscribe({
        next: (result) => {
          // Assert
          expect(httpServiceMock.get).toHaveBeenCalledWith('/public_key/')
          expect(result).toEqual(publicKey)
        },
      })
    })
  })
})
