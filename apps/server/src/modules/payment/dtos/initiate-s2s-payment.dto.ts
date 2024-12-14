export class InitiateS2SPaymentDto {
  cardholder_name: string
  card_number: string
  expires: string
  cvc: string
  remote_ip: string
}
