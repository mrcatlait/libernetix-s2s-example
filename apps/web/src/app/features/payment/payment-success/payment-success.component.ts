import { Component, ChangeDetectionStrategy } from '@angular/core'
import { paymentSuccessSelectors } from '@selectors'
import { TuiIcon } from '@taiga-ui/core'
import { TuiBlockStatus } from '@taiga-ui/layout'

import { SelectorDirective } from '@core/directives'

@Component({
  selector: 's2s-payment-success',
  standalone: true,
  imports: [TuiBlockStatus, TuiIcon, SelectorDirective],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccessComponent {
  readonly selectors = paymentSuccessSelectors
}
