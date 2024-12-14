import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'

import { SignatureGuard } from '../guards'
import { InboxService } from '../services'
import { INBOX_ENDPOINTS } from '../constants'

import { PurchaseDto } from '@modules/purchase/dto'

@Controller(INBOX_ENDPOINTS.RESOURCE)
@UseGuards(SignatureGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Post(INBOX_ENDPOINTS.PURCHASE_PAID)
  purchasePaid(@Body() data: PurchaseDto): Promise<void> {
    return this.inboxService.purchasePaid(data)
  }

  @Post(INBOX_ENDPOINTS.PURCHASE_FAILED)
  purchaseFailed(@Body() data: PurchaseDto): Promise<void> {
    return this.inboxService.purchaseFailed(data)
  }
}
