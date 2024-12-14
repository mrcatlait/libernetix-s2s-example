import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { ConfigService } from '@nestjs/config'

import { CreatePurchaseDto } from '../dto'
import { PurchaseConnectorService } from './purchase-connector.service'
import { Purchase } from '../models'

import { EnvironmentVariables } from '@modules/shared/models'

@Injectable()
export class PurchaseService {
  private readonly brandId = this.configService.get('BRAND_ID')
  private readonly redirectUrl = this.configService.get('UI_URL')

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly purchaseConnector: PurchaseConnectorService,
  ) {}

  async createPurchase(data: {
    client: { email: string }
    currency: string
    products: Array<{ name: string; price: number }>
  }): Promise<Purchase> {
    try {
      const createPurchasePayload: CreatePurchaseDto = {
        client: {
          email: data.client.email,
        },
        purchase: {
          currency: data.currency,
          products: data.products,
        },
        brand_id: this.brandId,
        success_redirect: `${this.redirectUrl}/success`,
        failure_redirect: `${this.redirectUrl}/failure`,
      }

      const purchase = await firstValueFrom(this.purchaseConnector.createPurchase(createPurchasePayload))

      this.logger.log(`Purchase created with id ${purchase.id}`)

      return purchase
    } catch (error) {
      this.logger.error(`Failed to create purchase ${(error as Error).message}`)
      throw new InternalServerErrorException()
    }
  }
}
