import { WebhookEvent } from '../enums'

export class CreateWebhookDto {
  title: string
  all_events: boolean
  events: WebhookEvent[]
  callback: string
}
