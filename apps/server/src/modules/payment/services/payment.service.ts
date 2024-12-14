import { Injectable, InternalServerErrorException, Logger, forwardRef, Inject } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

import {
  InitiatePaymentDto,
  InitiatePaymentPayloadDto,
  InitiateS2SPaymentDto,
  S2SPayment3DSecurePayloadDto,
  S2SPaymentPayloadDto,
} from '../dtos'
import { ProcessPaymentEvent } from '../events'
import { PaymentConnectorService } from './payment-connector.service'
import { S2SPaymentStatus } from '../enums'
import { PaymentStatusService } from './payment-status.service'
import { Payment3DSecureService } from './payment-3d-secure.service'

import { ProducerService } from '@modules/shared/services'
import { EventData } from '@modules/shared/models'
import { PurchaseService } from '@modules/purchase/services'

@Injectable()
export class PaymentService {
  private readonly CLIENT_EMAIL = 'test@test.com'

  constructor(
    private readonly logger: Logger,
    private readonly producerService: ProducerService,
    private readonly paymentConnectorService: PaymentConnectorService,
    private readonly purchaseService: PurchaseService,
    private readonly paymentStatusService: PaymentStatusService,
    @Inject(forwardRef(() => Payment3DSecureService))
    private readonly payment3DSecureService: Payment3DSecureService,
  ) {}

  async initiatePayment(remoteIp: string, initiatePaymentDto: InitiatePaymentDto): Promise<InitiatePaymentPayloadDto> {
    const amount = initiatePaymentDto.amount * 100

    const purchase = await this.purchaseService.createPurchase({
      client: {
        email: this.CLIENT_EMAIL,
      },
      currency: initiatePaymentDto.currency,
      products: [
        {
          name: 'Dynamic',
          price: amount,
        },
      ],
    })

    await this.producerService.sendMessage(
      new ProcessPaymentEvent({
        data: {
          purchaseId: purchase.id,
          directPostUrl: purchase.directPostUrl,
          cardholderName: initiatePaymentDto.cardholderName,
          cardNumber: initiatePaymentDto.cardNumber,
          expires: initiatePaymentDto.expires,
          cvc: initiatePaymentDto.cvc,
          remoteIp,
        },
      }),
    )

    return {
      purchaseId: purchase.id,
    }
  }

  async processPayment(data: EventData<ProcessPaymentEvent>) {
    const s2sPaymentPayload: InitiateS2SPaymentDto = {
      cardholder_name: data.cardholderName,
      card_number: data.cardNumber,
      expires: data.expires,
      cvc: data.cvc,
      remote_ip: data.remoteIp,
    }

    try {
      const result = await firstValueFrom(
        this.paymentConnectorService.initiateS2SPayment(data.directPostUrl, s2sPaymentPayload),
      )

      await this.handlePaymentStatus(data.purchaseId, result)
    } catch (error) {
      await this.paymentStatusService.handlePaymentError(data.purchaseId)
      this.logger.error(`Failed to process payment: ${data.purchaseId}`, error)
      throw new InternalServerErrorException()
    }
  }

  async handlePaymentStatus(purchaseId: string, result: S2SPaymentPayloadDto | S2SPayment3DSecurePayloadDto) {
    switch (result.status) {
      case S2SPaymentStatus.Executed:
        await this.paymentStatusService.handlePaymentExecuted(purchaseId)
        break
      case S2SPaymentStatus.Error:
        await this.paymentStatusService.handlePaymentError(purchaseId)
        break
      case S2SPaymentStatus.ThreeDSecureRequired:
        await this.payment3DSecureService.handleThreeDSecureRequired(purchaseId, result)
        break
      case S2SPaymentStatus.Pending:
      default:
        // Ignore and wait for webhook
        break
    }
  }
}
