import { HttpInstrumentationConfig } from '@opentelemetry/instrumentation-http'
import { ClientRequest, IncomingMessage } from 'http'

export const httpInstrumentation: HttpInstrumentationConfig = {
  ignoreIncomingRequestHook: (req) => {
    const ignorePatterns = [/favicon/, /swagger/]
    const url = req.url

    if (url && ignorePatterns.some((pattern) => pattern.test(url))) {
      return true
    }

    return false
  },
  requestHook: (span, req) => {
    if (req instanceof IncomingMessage) {
      const url = req.url

      if (url) {
        span.updateName(`${req.method} ${url}`)
      }
    }

    if (req instanceof ClientRequest) {
      const url = req.host + req.path

      span.updateName(`${req.method} ${url}`)
    }
  },
}
