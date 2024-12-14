import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins'
import { provideAnimations } from '@angular/platform-browser/animations'
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient } from '@angular/common/http'

import { routes } from './app.routes'

import { API_URL } from '@core/tokens'
import { environment } from '@environment'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    NG_EVENT_PLUGINS,
    { provide: API_URL, useValue: environment.apiUrl },
  ],
}
