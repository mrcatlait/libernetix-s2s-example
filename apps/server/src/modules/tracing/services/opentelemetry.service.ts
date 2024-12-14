import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { context, propagation } from '@opentelemetry/api'

import { amqplibInstrumentation, httpInstrumentation } from '../instrumentations'

import { Environment } from '@modules/shared/enums'
import { EnvironmentVariables } from '@modules/shared/models'

@Injectable()
export class OpenTelemetryService {
  private readonly sdk: NodeSDK | null = null

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    const otlpExporterUrl = this.configService.get('OTLP_EXPORTER_URL', { infer: true })

    if (!otlpExporterUrl) {
      this.logger.warn('OTLP_EXPORTER_URL is not set, tracing will not be enabled')
      return
    }

    const serviceName = this.configService.get('SERVICE_NAME', { infer: true })
    const jaegerUiUrl = this.configService.get('JAEGER_UI_URL', { infer: true })

    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })

    const traceExporter = new OTLPTraceExporter({
      url: `${otlpExporterUrl}/v1/traces`,
    })

    const traceSpanProcessor =
      nodeEnv === Environment.Development
        ? new SimpleSpanProcessor(traceExporter)
        : new BatchSpanProcessor(traceExporter)

    this.sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: serviceName,
      }),
      spanProcessors: [traceSpanProcessor],
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpExporterUrl}/v1/metrics`,
          concurrencyLimit: 1,
        }),
        exportIntervalMillis: 1000,
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': httpInstrumentation,
          '@opentelemetry/instrumentation-amqplib': amqplibInstrumentation,
        }),
      ],
    })

    process.on('SIGTERM', () => {
      this.sdk
        ?.shutdown()
        .then(
          () => this.logger.log('OTEL SDK shut down successfully'),
          (err) => this.logger.error('Error shutting down OTEL SDK', err),
        )
        .finally(() => process.exit(0))
    })

    this.logger.log(`Jaeger UI endpoint: ${jaegerUiUrl}`)
  }

  getTraceHeaders(): Record<string, string> {
    const traceHeaders: Record<string, string> = {}
    propagation.inject(context.active(), traceHeaders)

    return traceHeaders
  }

  start(): void {
    this.sdk?.start()
  }

  stop(): Promise<void> {
    return this.sdk?.shutdown() ?? Promise.resolve()
  }
}
