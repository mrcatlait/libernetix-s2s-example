import { ApiProperty } from '@nestjs/swagger'

import { ServiceHealth } from '../models'
import { DependencyStatus } from '../enums'

export class ServiceHealthDto implements ServiceHealth {
  @ApiProperty({ enum: DependencyStatus })
  status: DependencyStatus

  @ApiProperty({
    type: Number,
  })
  duration: number

  @ApiProperty({
    type: String,
    required: false,
  })
  error?: string
}
