import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import crypto from 'crypto'
import { Request } from 'express'
import { Observable } from 'rxjs'

import { InboxWebhookService } from '../services'

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private readonly inboxWebhookService: InboxWebhookService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>()

    const signature = req.headers['x-signature']
    const body = req.body

    if (!signature || Array.isArray(signature) || !body) {
      return false
    }

    const bodyBuffer = Buffer.from(JSON.stringify(body))

    try {
      return crypto.verify(
        'RSA-SHA256',
        bodyBuffer,
        this.inboxWebhookService.webhookPublicKey,
        Buffer.from(signature, 'base64'),
      )
    } catch {
      return false
    }
  }
}
