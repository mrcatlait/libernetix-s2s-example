import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, Min, IsEmail, IsInt, IsString, Matches, MaxLength, IsNumber } from 'class-validator'

export enum PaymentCurrency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
}

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'The amount to be charged',
    example: 100,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({
    description: 'The currency of the payment',
    enum: PaymentCurrency,
    example: PaymentCurrency.EUR,
  })
  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency

  @ApiProperty({
    description: 'The cardholder name',
    example: 'John Doe',
  })
  @IsString()
  @MaxLength(45)
  @Matches(/^[a-zA-Z\s'.,-]+$/)
  cardholderName: string

  @ApiProperty({
    description: 'The card number',
    example: '4444333322221111',
  })
  @IsString()
  @MaxLength(19)
  @Matches(/^\d+$/)
  cardNumber: string

  @ApiProperty({
    description: 'The card expiration date',
    example: '12/25',
  })
  @IsString()
  @MaxLength(5)
  @Matches(/^\d{2}\/\d{2}$/)
  expires: string

  @ApiProperty({
    description: 'The card CVC',
    example: '123',
  })
  @IsString()
  @MaxLength(4)
  @Matches(/^\d+$/)
  cvc: string
}
