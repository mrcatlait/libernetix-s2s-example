import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TuiIcon } from '@taiga-ui/core'
import { TuiBlockStatus } from '@taiga-ui/layout'

@Component({
  selector: 's2s-payment-error',
  standalone: true,
  imports: [TuiBlockStatus, TuiIcon],
  templateUrl: './payment-error.component.html',
  styleUrl: './payment-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentErrorComponent {}
