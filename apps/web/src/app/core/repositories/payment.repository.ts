import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'

import { InitiatePaymentDto, InitiatePaymentPayloadDto, PaymentStatusDto } from '@core/dtos'
import { API_URL } from '@core/tokens'

@Injectable({
  providedIn: 'root',
})
export class PaymentRepository {
  private readonly httpClient = inject(HttpClient)
  private readonly apiUrl = inject(API_URL)

  initiatePayment(payload: InitiatePaymentDto): Observable<InitiatePaymentPayloadDto> {
    return this.httpClient.post<InitiatePaymentPayloadDto>(`${this.apiUrl}/payments`, payload)
  }

  watchPaymentEvents(purchaseId: string): Observable<PaymentStatusDto> {
    const eventSource = new EventSource(`${this.apiUrl}/payments/${purchaseId}/events`)

    return new Observable((observer) => {
      eventSource.onmessage = (event) => {
        console.log(event)
        console.log(event.data)
        const messageData: PaymentStatusDto = JSON.parse(event.data)
        observer.next(messageData)
      }
    })
  }
}
