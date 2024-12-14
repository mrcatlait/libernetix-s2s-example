import { WebhookEvent } from '../enums'

export class WebhookPayloadDto {
  type: string
  id: string
  created_on: number
  updated_on: number
  title: string
  public_key: string
  all_events: boolean
  events: WebhookEvent[]
  callback: string
}
