import { inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router)

  goToHomePage(): void {
    this.router.navigate(['/'])
  }

  goToProcessingPage(): void {
    this.router.navigate(['/processing'])
  }

  goToErrorPage(): void {
    this.router.navigate(['/error'])
  }

  goToSuccessPage(): void {
    this.router.navigate(['/success'])
  }
}
