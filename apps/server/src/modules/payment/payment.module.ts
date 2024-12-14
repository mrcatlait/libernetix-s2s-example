import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { MongooseModule } from '@nestjs/mongoose'

import { PaymentController, PaymentEventsController } from './controllers'
import {
  PaymentService,
  PaymentConnectorService,
  PaymentEventsService,
  Payment3DSecureService,
  PaymentStatusService,
} from './services'
import { ThreeDSecureCallback, ThreeDSecureCallbackSchema } from './schemas'

@Global()
@Module({
  imports: [
    HttpModule.register({}),
    MongooseModule.forFeature([{ name: ThreeDSecureCallback.name, schema: ThreeDSecureCallbackSchema }]),
  ],
  controllers: [PaymentController, PaymentEventsController],
  providers: [
    PaymentService,
    PaymentConnectorService,
    PaymentEventsService,
    Payment3DSecureService,
    PaymentStatusService,
  ],
})
export class PaymentModule {}
