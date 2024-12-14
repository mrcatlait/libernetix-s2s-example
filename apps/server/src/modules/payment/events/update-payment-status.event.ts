import { ThreeDSecureRequestDto } from '../dtos'
import { PaymentEvents, PaymentStatus } from '../enums'

import { AbstractEvent } from '@modules/shared/classes'

interface UpdatePaymentStatusEventData {
  purchaseId: string
  status: PaymentStatus
  threeDSecureRequest?: ThreeDSecureRequestDto
}

export class UpdatePaymentStatusEvent extends AbstractEvent<UpdatePaymentStatusEventData> {
  readonly pattern = PaymentEvents.UpdatePaymentStatus
}
