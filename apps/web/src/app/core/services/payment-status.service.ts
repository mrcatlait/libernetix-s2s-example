import { Injectable, OnDestroy, inject, signal } from '@angular/core'
import { Subscription } from 'rxjs'

import { PaymentStatusDto } from '@core/dtos'
import { PaymentRepository } from '@core/repositories'

@Injectable({ providedIn: 'root' })
export class PaymentStatusService implements OnDestroy {
  private readonly paymentRepository = inject(PaymentRepository)

  private currentSubscription?: Subscription

  readonly paymentStatus = signal<PaymentStatusDto | null>(null)

  ngOnDestroy(): void {
    this.currentSubscription?.unsubscribe()
  }

  watchPaymentEvents(purchaseId: string): void {
    this.currentSubscription?.unsubscribe()

    this.currentSubscription = this.paymentRepository.watchPaymentEvents(purchaseId).subscribe((paymentStatus) => {
      this.paymentStatus.set(paymentStatus)
    })
  }
}
