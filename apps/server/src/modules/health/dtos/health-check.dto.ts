import { ApiProperty } from '@nestjs/swagger'

import { HealthStatus } from '../enums/health-status.enum'
import { ServiceHealth } from '../models'
import { SystemMetricsDto } from './system-metrics.dto'

export class HealthCheckDto {
  @ApiProperty({ enum: HealthStatus })
  status: HealthStatus

  @ApiProperty({
    type: String,
  })
  timestamp: string

  @ApiProperty({
    type: Object,
  })
  services: Record<string, ServiceHealth>

  @ApiProperty({
    type: SystemMetricsDto,
  })
  system: SystemMetricsDto
}
