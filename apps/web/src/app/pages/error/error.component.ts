import { Component, ChangeDetectionStrategy } from '@angular/core'

import { PaymentErrorComponent } from '@features/payment/payment-error/payment-error.component'

@Component({
  selector: 's2s-error-page',
  standalone: true,
  imports: [PaymentErrorComponent],
  template: `<s2s-payment-error />`,
  styleUrl: './error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {}
