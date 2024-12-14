import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ThreeDSecureCallbackDocument = HydratedDocument<ThreeDSecureCallback>

@Schema()
export class ThreeDSecureCallback {
  @Prop({ required: true })
  purchaseId: string

  @Prop({ required: true })
  callbackUrl: string

  @Prop({ required: true })
  createdAt: Date
}

export const ThreeDSecureCallbackSchema = SchemaFactory.createForClass(ThreeDSecureCallback)
