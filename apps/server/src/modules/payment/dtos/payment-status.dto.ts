import { ApiProperty } from '@nestjs/swagger'

import { PaymentStatus } from '../enums'
import { ThreeDSecureRequestDto } from './three-d-secure-request.dto'

export class PaymentStatusDto {
  @ApiProperty()
  purchaseId: string

  @ApiProperty({
    enum: PaymentStatus,
  })
  status: PaymentStatus

  @ApiProperty({
    type: ThreeDSecureRequestDto,
    required: false,
  })
  threeDSecureRequest?: ThreeDSecureRequestDto
}
