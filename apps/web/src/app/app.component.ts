import { TuiRoot } from '@taiga-ui/core'
import { ChangeDetectionStrategy, Component } from '@angular/core'

import { LayoutComponent } from '@features/layout/layout.component'

@Component({
  selector: 's2s-root',
  imports: [TuiRoot, LayoutComponent],
  template: `
    <tui-root>
      <s2s-layout />
    </tui-root>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
