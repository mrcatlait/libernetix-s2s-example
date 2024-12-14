import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { ConfigService } from '@nestjs/config'

import { InboxConnectorService } from './inbox-connector.service'
import { WebhookEvent } from '../enums'
import { INBOX_ENDPOINTS } from '../constants'
import { WebhookPayloadDto } from '../dtos'

import { EnvironmentVariables } from '@modules/shared/models'

@Injectable()
export class InboxWebhookService implements OnApplicationBootstrap {
  webhookPublicKey = ''

  private readonly purchasePaidWebhookKey = 'purchase-paid'
  private readonly purchaseFailedWebhookKey = 'purchase-failed'

  private readonly selfUrl: string

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly inboxConnectorService: InboxConnectorService,
  ) {
    this.selfUrl = this.configService.get('SELF_URL')
  }

  async onApplicationBootstrap() {
    await this.setupWebhooks()
    await this.setupPublicKey()
  }

  async setupPublicKey() {
    try {
      const publicKey = await firstValueFrom(this.inboxConnectorService.getPublicKey())
      this.webhookPublicKey = publicKey
    } catch (error) {
      this.logger.error('Error setting up public key', (error as Error).message)

      if (error instanceof AxiosError) {
        this.logger.warn('Error setting up public key', error.cause)
      }
    }
  }

  async setupWebhooks() {
    try {
      const webhooks = await firstValueFrom(this.inboxConnectorService.getWebhooks())

      const purchasePaidWebhook = webhooks.find((webhook) => webhook.title === this.purchasePaidWebhookKey)

      if (!purchasePaidWebhook) {
        await this.setupPurchasePaidWebhook()
      } else if (!purchasePaidWebhook.callback.includes(this.selfUrl)) {
        await firstValueFrom(this.inboxConnectorService.deleteWebhook(purchasePaidWebhook.id))
        await this.setupPurchasePaidWebhook()
      }

      const purchaseFailedWebhook = webhooks.find((webhook) => webhook.title === this.purchaseFailedWebhookKey)
      if (!purchaseFailedWebhook) {
        await this.setupPurchaseFailedWebhook()
      } else if (!purchaseFailedWebhook.callback.includes(this.selfUrl)) {
        await firstValueFrom(this.inboxConnectorService.deleteWebhook(purchaseFailedWebhook.id))
        await this.setupPurchaseFailedWebhook()
      }
    } catch (error) {
      this.logger.error('Error setting up webhooks', (error as Error).message)

      if (error instanceof AxiosError) {
        this.logger.warn('Error setting up webhooks', error.cause)
      }
    }
  }

  setupPurchasePaidWebhook(): Promise<WebhookPayloadDto> {
    return firstValueFrom(
      this.inboxConnectorService.createWebhook({
        title: this.purchasePaidWebhookKey,
        all_events: false,
        events: [WebhookEvent.PurchasePaid],
        callback: `${this.selfUrl}/${INBOX_ENDPOINTS.RESOURCE}/${INBOX_ENDPOINTS.PURCHASE_PAID}`,
      }),
    )
  }

  setupPurchaseFailedWebhook(): Promise<WebhookPayloadDto> {
    return firstValueFrom(
      this.inboxConnectorService.createWebhook({
        title: this.purchaseFailedWebhookKey,
        all_events: false,
        events: [WebhookEvent.PurchaseFailed],
        callback: `${this.selfUrl}/${INBOX_ENDPOINTS.RESOURCE}/${INBOX_ENDPOINTS.PURCHASE_FAILED}`,
      }),
    )
  }
}
