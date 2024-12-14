import { ThreeDSecureRequestDto } from './three-d-secure-request.dto'

import { PaymentStatus } from '@core/enums'

export interface PaymentStatusDto {
  purchaseId: string
  status: PaymentStatus
  threeDSecureRequest?: ThreeDSecureRequestDto
}
