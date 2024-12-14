import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { HealthController } from './controllers'
import { HealthService, ServiceMetricsService, SystemMetricsService } from './services'

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [HealthService, SystemMetricsService, ServiceMetricsService],
})
export class HealthModule {}
