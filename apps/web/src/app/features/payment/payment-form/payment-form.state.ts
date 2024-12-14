import { computed, inject, Injectable, signal } from '@angular/core'
import { take } from 'rxjs'

import { InitiatePaymentDto } from '@core/dtos'
import { PaymentRepository } from '@core/repositories'
import { FetchStatus } from '@core/enums'
import { PaymentState } from '@core/state'

@Injectable()
export class PaymentFormState {
  private readonly paymentState = inject(PaymentState)
  private readonly paymentRepository = inject(PaymentRepository)

  readonly status = signal(FetchStatus.Pending)

  readonly loading = computed(() => this.status() === FetchStatus.Loading)

  initiatePayment(payload: InitiatePaymentDto): void {
    this.status.set(FetchStatus.Loading)

    this.paymentRepository
      .initiatePayment(payload)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.paymentState.processPurchase(response.purchaseId)
          this.status.set(FetchStatus.Success)
        },
        error: (error) => {
          console.log('Initiate payment error', error)
          this.status.set(FetchStatus.Error)
        },
      })
  }
}
