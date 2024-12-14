import { PaymentEvents } from '../enums'

import { AbstractEvent } from '@modules/shared/classes/abstract-event.class'

interface ProcessPaymentEventData {
  purchaseId: string
  directPostUrl: string
  cardholderName: string
  cardNumber: string
  expires: string
  cvc: string
  remoteIp: string
}

export class ProcessPaymentEvent extends AbstractEvent<ProcessPaymentEventData> {
  readonly pattern = PaymentEvents.ProcessPayment
}
