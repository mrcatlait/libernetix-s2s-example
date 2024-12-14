import { Injectable } from '@nestjs/common'

import { ProducerService } from '@modules/shared/services'
import { UpdatePaymentStatusEvent } from '@modules/payment/events'
import { PaymentStatus } from '@modules/payment/enums'
import { PurchaseDto } from '@modules/purchase/dto'

@Injectable()
export class InboxService {
  constructor(private readonly producerService: ProducerService) {}

  purchasePaid(data: PurchaseDto) {
    return this.producerService.sendMessage(
      new UpdatePaymentStatusEvent({
        data: {
          purchaseId: data.id,
          status: PaymentStatus.Executed,
        },
      }),
    )
  }

  purchaseFailed(data: PurchaseDto) {
    return this.producerService.sendMessage(
      new UpdatePaymentStatusEvent({
        data: {
          purchaseId: data.id,
          status: PaymentStatus.Failed,
        },
      }),
    )
  }
}
