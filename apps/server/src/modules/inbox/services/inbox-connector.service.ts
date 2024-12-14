import { Injectable } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { HttpService } from '@nestjs/axios'

import { CreateWebhookDto, WebhookPayloadDto } from '../dtos'

@Injectable()
export class InboxConnectorService {
  constructor(private readonly httpService: HttpService) {}

  createWebhook(createWebhookDto: CreateWebhookDto): Observable<WebhookPayloadDto> {
    return (
      this.httpService
        // API has broken routing and requires a trailing slash in the end
        .post<WebhookPayloadDto>(`/webhooks/`, {
          ...createWebhookDto,
        })
        .pipe(map((response) => response.data))
    )
  }

  getWebhooks(): Observable<WebhookPayloadDto[]> {
    return this.httpService
      .get<{ results: WebhookPayloadDto[] }>(`/webhooks/`)
      .pipe(map((response) => response.data.results))
  }

  deleteWebhook(id: string): Observable<void> {
    return this.httpService.delete<void>(`/webhooks/${id}/`).pipe(map((response) => response.data))
  }

  getPublicKey(): Observable<string> {
    return this.httpService.get<string>(`/public_key/`).pipe(map((response) => response.data))
  }
}
