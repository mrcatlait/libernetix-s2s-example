import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { firstValueFrom } from 'rxjs'

import { S2SPayment3DSecurePayloadDto, ThreeDSecureCallbackDto, ThreeDSecureRequestDto } from '../dtos'
import { PaymentStatusService } from './payment-status.service'
import { PaymentConnectorService } from './payment-connector.service'
import { ThreeDSecureCallback } from '../schemas'
import { CALLBACK_EXPIRATION_TIME } from '../constants'
import { PaymentService } from './payment.service'

import { EnvironmentVariables } from '@modules/shared/models'

@Injectable()
export class Payment3DSecureService {
  private readonly selfUrl = this.configService.get('SELF_URL', { infer: true })

  constructor(
    private readonly paymentStatusService: PaymentStatusService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly paymentConnectorService: PaymentConnectorService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @InjectModel(ThreeDSecureCallback.name) private readonly threeDSecureCallbackModel: Model<ThreeDSecureCallback>,
  ) {}

  async handleThreeDSecureRequired(purchaseId: string, s2sPaymentPayload: S2SPayment3DSecurePayloadDto): Promise<void> {
    await this.threeDSecureCallbackModel.create({
      purchaseId,
      callbackUrl: s2sPaymentPayload.callback_url,
      createdAt: new Date(),
    })

    const request = this.buildThreeDSecureRequest(purchaseId, s2sPaymentPayload)

    return this.paymentStatusService.handleThreeDSecureRequired(purchaseId, request)
  }

  async handleThreeDSecureCallback(purchaseId: string, callback: ThreeDSecureCallbackDto): Promise<void> {
    const { MD, PaRes } = callback

    const threeDSecureCallback = await this.threeDSecureCallbackModel.findOne({ purchaseId })

    if (!threeDSecureCallback) {
      throw new NotFoundException('ThreeDSecureCallback not found')
    }

    const { callbackUrl, createdAt } = threeDSecureCallback

    if (createdAt.getTime() + CALLBACK_EXPIRATION_TIME < Date.now()) {
      throw new BadRequestException('ThreeDSecureCallback expired')
    }

    const response = await firstValueFrom(
      this.paymentConnectorService.completeThreeDSecure({
        callbackUrl,
        MD,
        PaRes,
      }),
    )

    await this.threeDSecureCallbackModel.deleteOne({ purchaseId })

    return this.paymentService.handlePaymentStatus(purchaseId, response)
  }

  buildThreeDSecureRequest(
    purchaseId: string,
    s2sPaymentPayload: S2SPayment3DSecurePayloadDto,
  ): ThreeDSecureRequestDto {
    const url = new URL(s2sPaymentPayload.URL)
    const MD = s2sPaymentPayload.MD ?? ''
    const PaReq = s2sPaymentPayload.PaReq
    const TermUrl = `${this.selfUrl}/payments/${purchaseId}/callback`

    const method = s2sPaymentPayload.Method

    if (method === 'GET') {
      url.searchParams.set('MD', MD)
      url.searchParams.set('PaReq', PaReq)
      url.searchParams.set('TermUrl', TermUrl)

      return {
        url: url.toString(),
        method: 'GET',
      }
    }

    if (method === 'POST') {
      return {
        url: url.toString(),
        body: {
          MD,
          PaReq,
          TermUrl,
        },
        method: 'POST',
      }
    }

    throw new InternalServerErrorException('Invalid 3D Secure response')
  }
}
