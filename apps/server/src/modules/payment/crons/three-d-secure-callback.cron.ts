import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'

import { ThreeDSecureCallback } from '../schemas'
import { CALLBACK_EXPIRATION_TIME } from '../constants'

@Injectable()
export class ThreeDSecureCallbackCron {
  constructor(
    private readonly logger: Logger,
    @InjectModel(ThreeDSecureCallback.name) private readonly threeDSecureCallbackModel: Model<ThreeDSecureCallback>,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async setCurrencyForeignExchangeRates(): Promise<void> {
    const threeDSecureCallbacks = await this.threeDSecureCallbackModel.find({
      createdAt: { $lt: new Date(Date.now() - CALLBACK_EXPIRATION_TIME) },
    })

    for (const threeDSecureCallback of threeDSecureCallbacks) {
      await this.threeDSecureCallbackModel.deleteOne({ _id: threeDSecureCallback._id })
    }

    this.logger.log(`ThreeDSecureCallbackCron: ${threeDSecureCallbacks.length} callbacks have been deleted`)
  }
}
