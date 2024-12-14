import { Module, Global } from '@nestjs/common'

import { OpenTelemetryService, TraceService } from './services'

@Global()
@Module({
  providers: [OpenTelemetryService, TraceService],
  exports: [OpenTelemetryService, TraceService],
})
export class TracingModule {}
