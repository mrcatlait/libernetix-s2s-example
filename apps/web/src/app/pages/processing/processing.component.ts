import { ChangeDetectionStrategy, Component } from '@angular/core'

import { PaymentProcessingComponent } from '@features/payment/payment-processing/payment-processing.component'

@Component({
  selector: 's2s-processing-page',
  standalone: true,
  imports: [PaymentProcessingComponent],
  template: `<s2s-payment-processing />`,
  styleUrl: './processing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingPage {}
