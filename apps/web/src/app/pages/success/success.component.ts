import { ChangeDetectionStrategy, Component } from '@angular/core'

import { PaymentSuccessComponent } from '@features/payment/payment-success/payment-success.component'

@Component({
  selector: 's2s-success-page',
  standalone: true,
  imports: [PaymentSuccessComponent],
  template: `<s2s-payment-success />`,
  styleUrl: './success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPage {}
