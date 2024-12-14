import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Sse,
  Param,
  MessageEvent,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common'
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'

import { InitiatePaymentDto, InitiatePaymentPayloadDto, PaymentStatusDto, ThreeDSecureCallbackDto } from '../dtos'
import { PaymentEventsService, PaymentService, Payment3DSecureService } from '../services'

import { EnvironmentVariables } from '@modules/shared/models'

@Controller({
  path: 'payments',
})
export class PaymentController {
  private readonly uiUrl = this.configService.get('UI_URL', { infer: true })

  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentEventsService: PaymentEventsService,
    private readonly payment3DSecureService: Payment3DSecureService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  @Post()
  @ApiBody({
    type: InitiatePaymentDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: InitiatePaymentPayloadDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  initiatePayment(@Body() paymentData: InitiatePaymentDto, @Req() req: Request): Promise<InitiatePaymentPayloadDto> {
    return this.paymentService.initiatePayment(req.ip ?? '', paymentData)
  }

  @Sse(':purchaseId/events')
  @ApiParam({
    name: 'purchaseId',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaymentStatusDto,
  })
  paymentEvents(@Param('purchaseId') purchaseId: string): Observable<MessageEvent> {
    return this.paymentEventsService.getEventsByTransactionId(purchaseId)
  }

  @Post(':purchaseId/callback')
  @ApiParam({
    name: 'purchaseId',
    type: String,
  })
  @ApiBody({
    type: ThreeDSecureCallbackDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async threeDSecureCallback(
    @Param('purchaseId') purchaseId: string,
    @Body() body: ThreeDSecureCallbackDto,
  ): Promise<void> {
    console.log(body)
    return this.payment3DSecureService.handleThreeDSecureCallback(purchaseId, body)
  }
}
