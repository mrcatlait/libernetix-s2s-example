import { Controller, Get, Header } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { HealthService } from '../services'
import { HealthStatus } from '../enums/health-status.enum'
import { HealthCheckDto } from '../dtos'

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get detailed health status' })
  @ApiResponse({
    status: 200,
    description: 'Health check results',
    type: HealthCheckDto,
  })
  @Header('Cache-Control', 'no-cache')
  getHealth() {
    return this.healthService.check()
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Basic liveness probe' })
  @Header('Cache-Control', 'no-cache')
  getLiveness(): { status: string } {
    return { status: 'alive' }
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe' })
  @Header('Cache-Control', 'no-cache')
  async getReadiness(): Promise<{ status: string }> {
    const health = await this.healthService.check()

    return {
      status: health.status === HealthStatus.Unhealthy ? 'not_ready' : 'ready',
    }
  }
}
