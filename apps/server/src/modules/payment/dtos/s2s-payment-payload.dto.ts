import { S2SPaymentStatus } from '../enums'

export class S2SPaymentPayloadDto {
  status: S2SPaymentStatus.Authorized | S2SPaymentStatus.Error | S2SPaymentStatus.Pending | S2SPaymentStatus.Executed
}

export class S2SPayment3DSecurePayloadDto {
  status: S2SPaymentStatus.ThreeDSecureRequired
  Method: string
  PaReq: string
  MD?: string
  URL: string
  callback_url: string
}
