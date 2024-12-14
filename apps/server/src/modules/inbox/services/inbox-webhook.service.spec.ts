import { Test } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { AxiosError } from 'axios'

import { InboxWebhookService } from './inbox-webhook.service'
import { InboxConnectorService } from './inbox-connector.service'
import { WebhookEvent } from '../enums'
import { INBOX_ENDPOINTS } from '../constants'
import { WebhookPayloadDto } from '../dtos'

describe('InboxWebhookService', () => {
  let service: InboxWebhookService
  let inboxConnectorServiceMock: PartiallyMocked<InboxConnectorService>
  let configServiceMock: PartiallyMocked<ConfigService>
  let loggerMock: PartiallyMocked<Logger>

  const mockConfig = {
    SELF_URL: 'http://self.test',
  }

  beforeEach(async () => {
    inboxConnectorServiceMock = {
      getPublicKey: vi.fn(),
      getWebhooks: vi.fn(),
      createWebhook: vi.fn(),
      deleteWebhook: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn((key: string) => mockConfig[key]),
    }

    loggerMock = {
      error: vi.fn(),
      warn: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        InboxWebhookService,
        { provide: InboxConnectorService, useValue: inboxConnectorServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile()

    service = moduleRef.get<InboxWebhookService>(InboxWebhookService)
  })

  describe('setupPublicKey', () => {
    it('should setup public key', async () => {
      // Arrange
      inboxConnectorServiceMock.getPublicKey?.mockReturnValue(of('publicKey'))

      // Act
      await service.setupPublicKey()

      // Assert
      expect(service.webhookPublicKey).toBe('publicKey')
    })

    it('should log error if setup fails', async () => {
      // Arrange
      const error = new AxiosError('Network Error')
      inboxConnectorServiceMock.getPublicKey?.mockReturnValue(throwError(() => error))

      // Act
      await service.setupPublicKey()

      // Assert
      expect(loggerMock.error).toHaveBeenCalledWith('Error setting up public key', 'Network Error')
      expect(loggerMock.warn).toHaveBeenCalledWith('Error setting up public key', error.cause)
    })
  })

  describe('setupWebhooks', () => {
    it('should setup webhooks if not present', async () => {
      // Arrange
      inboxConnectorServiceMock.getWebhooks?.mockReturnValue(of([]))
      inboxConnectorServiceMock.createWebhook?.mockReturnValue(of({} as WebhookPayloadDto))

      // Act
      await service.setupWebhooks()

      // Assert
      expect(inboxConnectorServiceMock.createWebhook).toHaveBeenCalledTimes(2)
      expect(inboxConnectorServiceMock.createWebhook).toHaveBeenCalledWith({
        title: 'purchase-paid',
        all_events: false,
        events: [WebhookEvent.PurchasePaid],
        callback: `${mockConfig.SELF_URL}/${INBOX_ENDPOINTS.RESOURCE}/${INBOX_ENDPOINTS.PURCHASE_PAID}`,
      })
      expect(inboxConnectorServiceMock.createWebhook).toHaveBeenCalledWith({
        title: 'purchase-failed',
        all_events: false,
        events: [WebhookEvent.PurchaseFailed],
        callback: `${mockConfig.SELF_URL}/${INBOX_ENDPOINTS.RESOURCE}/${INBOX_ENDPOINTS.PURCHASE_FAILED}`,
      })
    })

    it('should delete and recreate webhook if callback URL is incorrect', async () => {
      // Arrange
      const incorrectWebhook = { id: '1', title: 'purchase-paid', callback: 'http://wrong.url' }
      inboxConnectorServiceMock.getWebhooks?.mockReturnValue(of([incorrectWebhook] as WebhookPayloadDto[]))
      inboxConnectorServiceMock.createWebhook?.mockReturnValue(of({} as WebhookPayloadDto))
      inboxConnectorServiceMock.deleteWebhook?.mockReturnValue(of({} as unknown as void))

      // Act
      await service.setupWebhooks()

      // Assert
      expect(inboxConnectorServiceMock.deleteWebhook).toHaveBeenCalledWith('1')
      expect(inboxConnectorServiceMock.createWebhook).toHaveBeenCalledTimes(2)
    })

    it('should log error if setup fails', async () => {
      // Arrange
      const error = new AxiosError('Network Error')
      inboxConnectorServiceMock.getWebhooks?.mockReturnValue(throwError(() => error))

      // Act
      await service.setupWebhooks()

      // Assert
      expect(loggerMock.error).toHaveBeenCalledWith('Error setting up webhooks', 'Network Error')
      expect(loggerMock.warn).toHaveBeenCalledWith('Error setting up webhooks', error.cause)
    })
  })
})
