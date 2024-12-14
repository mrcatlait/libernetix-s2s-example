import { Currency } from '@core/enums'

export interface InitiatePaymentDto {
  amount: number
  currency: Currency
  cardholderName: string
  cardNumber: string
  expires: string
  cvc: string
}
