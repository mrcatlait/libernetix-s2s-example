import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

import { DependencyStatus } from '../enums/dependency-status.enum'
import { ServiceHealth } from '../models'

import { EnvironmentVariables } from '@modules/shared/models'
import { InboxConnectorService } from '@modules/inbox/services/inbox-connector.service'

@Injectable()
export class ServiceMetricsService {
  private readonly jaegerUiUrl: string
  private readonly rabbitMetricsUrl: string

  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly inboxConnectorService: InboxConnectorService,
  ) {
    this.jaegerUiUrl = this.configService.get('JAEGER_UI_URL')
    this.rabbitMetricsUrl = this.configService.get('RMQ_METRICS_URL')
  }

  async checkServices(): Promise<Record<string, ServiceHealth>> {
    const checks = {
      api: () => firstValueFrom(this.inboxConnectorService.getPublicKey()),
      jaeger: () => firstValueFrom(this.httpService.get(this.jaegerUiUrl)),
      rabbit: () => firstValueFrom(this.httpService.get(this.rabbitMetricsUrl)),
    }

    const results = await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        let status = DependencyStatus.Up
        let duration = -performance.now()
        let error: string | undefined

        try {
          await check()
          status = DependencyStatus.Up
        } catch (e) {
          status = DependencyStatus.Down
          error = 'Unknown error'

          if (e instanceof Error) {
            error = e.message
          }

          this.logger.error(`Health check failed for ${name}`, error)
        }

        duration += performance.now()
        duration = Math.round(duration)

        return [name, { status, duration, error }]
      }),
    )

    return Object.fromEntries(results)
  }
}
