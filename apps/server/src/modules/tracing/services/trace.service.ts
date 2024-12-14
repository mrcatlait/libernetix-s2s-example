import { context, trace, Span, SpanStatusCode } from '@opentelemetry/api'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TraceService {
  getTracer() {
    return trace.getTracer('default')
  }

  getSpan(): Span | undefined {
    return trace.getSpan(context.active())
  }

  startSpan(name: string): Span {
    return this.getTracer().startSpan(name)
  }

  addMetadata(metadata: Record<string, string>) {
    const span = this.getSpan()

    if (!span) return

    Object.entries(metadata).forEach(([key, value]) => {
      span.setAttribute(`custom.metadata.${key}`, value)
    })
  }

  startActiveSpan<T>(name: string, fn: (span: Span) => Promise<T> | T): Promise<T> {
    const tracer = this.getTracer()

    return tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn(span)
        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        })
        throw error
      } finally {
        span.end()
      }
    })
  }
}
