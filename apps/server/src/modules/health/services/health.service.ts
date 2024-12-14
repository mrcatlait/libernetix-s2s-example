import { Injectable, Logger } from '@nestjs/common'

import { DependencyStatus, HealthStatus } from '../enums'
import { ServiceMetricsService } from './service-metrics.service'
import { SystemMetricsService } from './system-metrics.service'
import { ServiceHealth, SystemMetrics, Thresholds } from '../models'
import { HealthCheckDto } from '../dtos'

@Injectable()
export class HealthService {
  private readonly thresholds: Thresholds = {
    memory: 90, // 90% memory usage threshold
    cpu: 80, // 80% CPU usage threshold
    responseTime: 5000, // 5 seconds response time threshold
  }

  constructor(
    private readonly logger: Logger,
    private readonly serviceMetricsService: ServiceMetricsService,
    private readonly systemMetricsService: SystemMetricsService,
  ) {}

  async check(): Promise<HealthCheckDto> {
    const [services, systemMetrics] = await Promise.all([
      this.serviceMetricsService.checkServices(),
      this.systemMetricsService.getMetrics(),
    ])

    const status = this.determineOverallStatus(services, systemMetrics)

    const response: HealthCheckDto = {
      status,
      timestamp: new Date().toISOString(),
      services,
      system: systemMetrics,
    }

    if (status !== HealthStatus.Healthy) {
      this.logger.warn('Health check detected issues', JSON.stringify(response))
    }

    return response
  }

  determineOverallStatus(services: Record<string, ServiceHealth>, systemMetrics: SystemMetrics): HealthStatus {
    const criticalServices = ['api', 'rabbit']
    const hasCriticalFailure = criticalServices.some((service) => services[service].status === DependencyStatus.Down)

    if (hasCriticalFailure) {
      return HealthStatus.Unhealthy
    }

    const isMemoryHigh = systemMetrics.memory.usagePercent > this.thresholds.memory
    const isCpuHigh = systemMetrics.cpu.usagePercent > this.thresholds.cpu
    const isResponseTimeHigh = Object.values(services).some(
      (service) => service.duration > this.thresholds.responseTime,
    )

    if (isMemoryHigh || isCpuHigh || isResponseTimeHigh) {
      return HealthStatus.Degraded
    }

    const hasNonCriticalFailure = Object.values(services).some((service) => service.status === DependencyStatus.Down)

    return hasNonCriticalFailure ? HealthStatus.Degraded : HealthStatus.Healthy
  }
}
