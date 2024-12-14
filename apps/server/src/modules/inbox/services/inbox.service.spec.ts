import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'

import { InboxService } from './inbox.service'

import { ProducerService } from '@modules/shared/services'
import { UpdatePaymentStatusEvent } from '@modules/payment/events'
import { PaymentStatus } from '@modules/payment/enums'
import { PurchaseDto } from '@modules/purchase/dto'

describe('InboxService', () => {
  let service: InboxService
  let producerServiceMock: PartiallyMocked<ProducerService>

  const purchaseData: PurchaseDto = {
    id: '123',
    direct_post_url: 'https://example.com',
  }

  beforeEach(async () => {
    producerServiceMock = {
      sendMessage: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [InboxService, { provide: ProducerService, useValue: producerServiceMock }],
    }).compile()

    service = moduleRef.get<InboxService>(InboxService)
  })

  describe('purchasePaid', () => {
    it('should send message with executed payment status', async () => {
      // Arrange
      producerServiceMock.sendMessage?.mockResolvedValue(undefined)

      // Act
      await service.purchasePaid(purchaseData)

      // Assert
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(
        new UpdatePaymentStatusEvent({
          data: {
            purchaseId: purchaseData.id,
            status: PaymentStatus.Executed,
          },
        }),
      )
    })

    it('should propagate error if sending message fails', async () => {
      // Arrange
      const error = new Error('Failed to send message')
      producerServiceMock.sendMessage?.mockRejectedValue(error)

      // Act & Assert
      await expect(service.purchasePaid(purchaseData)).rejects.toThrow(error)
    })
  })

  describe('purchaseFailed', () => {
    it('should send message with failed payment status', async () => {
      // Arrange
      producerServiceMock.sendMessage?.mockResolvedValue(undefined)

      // Act
      await service.purchaseFailed(purchaseData)

      // Assert
      expect(producerServiceMock.sendMessage).toHaveBeenCalledWith(
        new UpdatePaymentStatusEvent({
          data: {
            purchaseId: purchaseData.id,
            status: PaymentStatus.Failed,
          },
        }),
      )
    })

    it('should propagate error if sending message fails', async () => {
      // Arrange
      const error = new Error('Failed to send message')
      producerServiceMock.sendMessage?.mockRejectedValue(error)

      // Act & Assert
      await expect(service.purchaseFailed(purchaseData)).rejects.toThrow(error)
    })
  })
})
