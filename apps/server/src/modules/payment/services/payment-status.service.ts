import { Injectable, Logger } from '@nestjs/common'

import { UpdatePaymentStatusEvent } from '../events'
import { PaymentStatus } from '../enums'
import { ThreeDSecureRequestDto } from '../dtos'

import { ProducerService } from '@modules/shared/services'
import { TraceService } from '@modules/tracing/services'

@Injectable()
export class PaymentStatusService {
  constructor(
    private readonly logger: Logger,
    private readonly traceService: TraceService,
    private readonly producerService: ProducerService,
  ) {}

  handlePaymentError(purchaseId: string): Promise<void> {
    this.logger.error(`Payment failed for purchase ${purchaseId}`)

    return this.traceService.startActiveSpan('payment.failed', async () => {
      this.traceService.addMetadata({
        purchaseId,
        status: PaymentStatus.Failed,
      })
      return this.producerService.sendMessage(
        new UpdatePaymentStatusEvent({
          data: {
            purchaseId,
            status: PaymentStatus.Failed,
          },
        }),
      )
    })
  }

  handlePaymentExecuted(purchaseId: string): Promise<void> {
    this.logger.log(`Payment executed for purchase ${purchaseId}`)

    return this.traceService.startActiveSpan('payment.executed', async () => {
      this.traceService.addMetadata({
        purchaseId,
        status: PaymentStatus.Executed,
      })
      return this.producerService.sendMessage(
        new UpdatePaymentStatusEvent({
          data: {
            purchaseId,
            status: PaymentStatus.Executed,
          },
        }),
      )
    })
  }

  handleThreeDSecureRequired(purchaseId: string, threeDSecureRequest: ThreeDSecureRequestDto): Promise<void> {
    this.logger.log(`ThreeDSecure required for purchase ${purchaseId}`)

    return this.traceService.startActiveSpan('payment.threeDSecureRequired', async () => {
      this.traceService.addMetadata({
        purchaseId,
        status: PaymentStatus.ThreeDSecureRequired,
      })

      return this.producerService.sendMessage(
        new UpdatePaymentStatusEvent({
          data: {
            purchaseId,
            status: PaymentStatus.ThreeDSecureRequired,
            threeDSecureRequest,
          },
        }),
      )
    })
  }
}
