import { RpcException } from '@nestjs/microservices'

export class PaymentException extends RpcException {
  constructor(
    readonly transactionId: string,
    message: string,
  ) {
    super(message)
  }
}
