import { AmqplibInstrumentationConfig } from '@opentelemetry/instrumentation-amqplib'

import { AbstractEvent } from '@modules/shared/classes'

export const amqplibInstrumentation: AmqplibInstrumentationConfig = {
  publishHook: (span, publishInfo) => {
    const event = JSON.parse(publishInfo.content.toString()) as AbstractEvent<unknown>
    span.updateName(`publish ${event.pattern}`)

    span.setAttribute('messaging.metadata.pattern', event.pattern)
  },
  consumeEndHook: (span, consumeEndInfo) => {
    const event = JSON.parse(consumeEndInfo.msg.content.toString()) as AbstractEvent<unknown>
    span.updateName(`consume ${event.pattern}`)

    span.setAttribute('messaging.metadata.pattern', event.pattern)
  },
}
