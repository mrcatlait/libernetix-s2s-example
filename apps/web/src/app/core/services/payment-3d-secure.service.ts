import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

import { ThreeDSecureRequestDto } from '@core/dtos'

@Injectable({ providedIn: 'root' })
export class Payment3DSecureService {
  private readonly httpClient = inject(HttpClient)

  start3DSecure(request?: ThreeDSecureRequestDto): void {
    if (!request) {
      return
    }

    if (request.method === 'POST') {
      this.httpClient.post(request.url, request.body).subscribe()
    } else if (request.method === 'GET') {
      this.httpClient.get(request.url).subscribe()
    }
  }
}
