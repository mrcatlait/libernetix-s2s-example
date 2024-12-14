import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TuiHeader } from '@taiga-ui/layout'

import { environment } from '@environment'

@Component({
  selector: 's2s-layout',
  standalone: true,
  imports: [TuiHeader, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly applicationName = environment.applicationName
}
