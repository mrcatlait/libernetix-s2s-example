import { ApiProperty } from '@nestjs/swagger'

export class ThreeDSecureRequestDto {
  @ApiProperty()
  method: string

  @ApiProperty()
  url: string

  @ApiProperty({
    type: Object,
    required: false,
  })
  body?: {
    MD: string
    PaReq: string
    TermUrl: string
  }
}
