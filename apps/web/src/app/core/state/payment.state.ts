import { computed, inject, Injectable, signal, effect } from '@angular/core'

import { PaymentStatus } from '@core/enums'
import { NavigationService, PaymentStatusService, Payment3DSecureService } from '@core/services'

@Injectable({ providedIn: 'root' })
export class PaymentState {
  private readonly navigationService = inject(NavigationService)
  private readonly paymentStatusService = inject(PaymentStatusService)
  private readonly payment3DSecureService = inject(Payment3DSecureService)

  private readonly purchaseId = signal<string | null>(null)
  private readonly paymentStatus = this.paymentStatusService.paymentStatus
  private readonly status = computed(() => this.paymentStatus()?.status)

  constructor() {
    effect(() => {
      this.handleStatusChange(this.status())
    })
  }

  processPurchase(purchaseId: string): void {
    this.purchaseId.set(purchaseId)
    this.paymentStatusService.watchPaymentEvents(purchaseId)
    this.navigationService.goToProcessingPage()
  }

  completePurchase() {
    this.purchaseId.set(null)
  }

  handleStatusChange(status?: PaymentStatus): void {
    switch (status) {
      case PaymentStatus.Executed:
        this.completePurchase()
        this.navigationService.goToSuccessPage()
        break
      case PaymentStatus.Failed:
        this.completePurchase()
        this.navigationService.goToErrorPage()
        break
      case PaymentStatus.ThreeDSecureRequired:
        this.payment3DSecureService.start3DSecure(this.paymentStatus()?.threeDSecureRequest)
        break
      default:
        break
    }
  }
}
