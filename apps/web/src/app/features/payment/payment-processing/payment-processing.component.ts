import { ChangeDetectionStrategy, Component } from '@angular/core'
import { paymentProcessingSelectors } from '@selectors'
import { TuiProgress } from '@taiga-ui/kit'
import { TuiBlockStatus } from '@taiga-ui/layout'

import { SelectorDirective } from '@core/directives'

@Component({
  selector: 's2s-payment-processing',
  standalone: true,
  imports: [TuiBlockStatus, TuiProgress, SelectorDirective],
  templateUrl: './payment-processing.component.html',
  styleUrl: './payment-processing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentProcessingComponent {
  readonly selectors = paymentProcessingSelectors
}
