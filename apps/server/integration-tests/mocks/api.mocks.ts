import nock, { Scope } from 'nock'

import { PurchaseDto } from '@modules/purchase/dto'
import { S2SPaymentPayloadDto } from '@modules/payment/dtos'
import { S2SPaymentStatus } from '@modules/payment/enums'
import { WebhookPayloadDto } from '@modules/inbox/dtos'

export class ApiMocks {
  private readonly scope: Scope

  constructor(apiUrl: string) {
    const apiBaseUrl = new URL(apiUrl).origin
    this.scope = nock(apiBaseUrl)

    this.mockGetWebhooks(200)
  }

  mockCreatePurchase(status: number = 200, response?: PurchaseDto) {
    const defaultResponse: PurchaseDto = {
      id: '123',
      direct_post_url: 'http://api.example.com/pay',
    }

    return this.scope.post('/purchases/').reply(status, response || defaultResponse)
  }

  mockInitiateS2SPayment(directPostUrl: string, status: number = 200, response?: S2SPaymentPayloadDto) {
    const defaultResponse: S2SPaymentPayloadDto = {
      status: S2SPaymentStatus.Executed,
    }

    return nock(directPostUrl)
      .post('?s2s=true')
      .reply(status, response || defaultResponse)
  }

  mockGetWebhooks(status: number = 200, response?: WebhookPayloadDto[]) {
    const defaultResponse: Partial<WebhookPayloadDto>[] = [
      {
        id: '123',
        title: 'purchase-paid',
        callback: 'http://localhost:3000/webhooks/purchase-paid',
      },
      {
        id: '456',
        title: 'purchase-failed',
        callback: 'http://localhost:3000/webhooks/purchase-failed',
      },
    ]

    return this.scope.get('/webhooks/').reply(status, { results: response || defaultResponse })
  }

  mockGetPublicKey(status: number = 200, response?: string) {
    return this.scope.get('/public_key/').reply(status, response)
  }

  mockThreeDSecureCallback(callbackUrl: string, status: number = 200, response?: S2SPaymentPayloadDto) {
    const defaultResponse: S2SPaymentPayloadDto = {
      status: S2SPaymentStatus.Executed,
    }

    return this.scope.post(callbackUrl).reply(status, response || defaultResponse)
  }
}
