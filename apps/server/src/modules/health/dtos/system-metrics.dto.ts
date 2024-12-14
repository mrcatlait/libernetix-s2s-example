import { ApiProperty } from '@nestjs/swagger'

import { SystemMetrics } from '../models'

export class SystemMetricsDto implements SystemMetrics {
  @ApiProperty({
    type: Object,
  })
  memory: {
    total: number
    used: number
    free: number
    usagePercent: number
  }

  @ApiProperty({
    type: Object,
  })
  cpu: {
    loadAvg: number[]
    usagePercent: number
  }
}
