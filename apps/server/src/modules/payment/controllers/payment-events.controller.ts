import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'

import { PaymentEvents } from '../enums'
import { PaymentEventsService, PaymentService } from '../services'
import { ProcessPaymentEvent, UpdatePaymentStatusEvent } from '../events'

import { EventData } from '@modules/shared/models'

@Controller()
export class PaymentEventsController {
  constructor(
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentService: PaymentService,
  ) {}

  @EventPattern(PaymentEvents.ProcessPayment)
  processPayment(@Payload() data: EventData<ProcessPaymentEvent>) {
    return this.paymentService.processPayment(data)
  }

  @EventPattern(PaymentEvents.UpdatePaymentStatus)
  updatePaymentStatus(@Payload() data: EventData<UpdatePaymentStatusEvent>) {
    return this.paymentEventsService.emitPaymentStatus(data)
  }
}
