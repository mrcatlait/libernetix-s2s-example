import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class InitiatePaymentPayloadDto {
  @ApiProperty({
    description: 'The purchase id',
    example: '123',
  })
  @IsString()
  purchaseId: string
}
