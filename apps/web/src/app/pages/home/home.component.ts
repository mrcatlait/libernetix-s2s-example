import { ChangeDetectionStrategy, Component } from '@angular/core'

import { PaymentFormComponent } from '@features/payment/payment-form/payment-form.component'

@Component({
  selector: 's2s-home-page',
  standalone: true,
  imports: [PaymentFormComponent],
  template: ` <s2s-payment-form /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
