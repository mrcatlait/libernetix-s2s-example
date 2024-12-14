import { Injectable, MessageEvent } from '@nestjs/common'
import { fromEvent, map, Observable } from 'rxjs'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { UpdatePaymentStatusEvent } from '../events'

import { EventData } from '@modules/shared/models'

@Injectable()
export class PaymentEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitPaymentStatus(data: EventData<UpdatePaymentStatusEvent>): void {
    this.eventEmitter.emit(this.getEventName(data.purchaseId), data)
  }

  getEventsByTransactionId(purchaseId: string): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, this.getEventName(purchaseId)).pipe(
      map((payload: EventData<UpdatePaymentStatusEvent>) => ({ data: JSON.stringify(payload) })),
    )
  }

  getEventName(purchaseId: string): string {
    return `payment.status.${purchaseId}`
  }
}
