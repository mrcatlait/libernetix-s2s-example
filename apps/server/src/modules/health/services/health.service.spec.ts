import { Logger } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { Test } from '@nestjs/testing'

import { HealthService } from './health.service'
import { ServiceMetricsService } from './service-metrics.service'
import { SystemMetricsService } from './system-metrics.service'
import { DependencyStatus, HealthStatus } from '../enums'
import { SystemMetrics } from '../models'

describe('HealthService', () => {
  let service: HealthService
  let loggerMock: PartiallyMocked<Logger>
  let serviceMetricsServiceMock: PartiallyMocked<ServiceMetricsService>
  let systemMetricsServiceMock: PartiallyMocked<SystemMetricsService>

  beforeEach(async () => {
    loggerMock = { warn: vi.fn() }
    serviceMetricsServiceMock = {
      checkServices: vi.fn(),
    }
    systemMetricsServiceMock = {
      getMetrics: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: ServiceMetricsService, useValue: serviceMetricsServiceMock },
        { provide: SystemMetricsService, useValue: systemMetricsServiceMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile()

    service = moduleRef.get(HealthService)
  })

  describe('check', () => {
    it('should return healthy status when all systems are normal', async () => {
      // Arrange
      const mockServices = {
        api: { status: DependencyStatus.Up, duration: 100 },
        rabbit: { status: DependencyStatus.Up, duration: 200 },
      }
      const mockMetrics: SystemMetrics = {
        memory: { total: 100, used: 70, free: 30, usagePercent: 70 },
        cpu: { usagePercent: 60, loadAvg: [1, 2, 3] },
      }

      serviceMetricsServiceMock.checkServices?.mockResolvedValue(mockServices)
      systemMetricsServiceMock.getMetrics?.mockResolvedValue(mockMetrics)

      // Act
      const result = await service.check()

      // Assert
      expect(result.status).toBe(HealthStatus.Healthy)
      expect(result.services).toEqual(mockServices)
      expect(result.system).toEqual(mockMetrics)
      expect(loggerMock.warn).not.toHaveBeenCalled()
    })

    it('should return unhealthy status when critical service is down', async () => {
      // Arrange
      const mockServices = {
        api: { status: DependencyStatus.Down, duration: 100 },
        rabbit: { status: DependencyStatus.Up, duration: 200 },
      }
      const mockMetrics: SystemMetrics = {
        memory: { total: 100, used: 70, free: 30, usagePercent: 70 },
        cpu: { usagePercent: 60, loadAvg: [1, 2, 3] },
      }

      serviceMetricsServiceMock.checkServices?.mockResolvedValue(mockServices)
      systemMetricsServiceMock.getMetrics?.mockResolvedValue(mockMetrics)

      // Act
      const result = await service.check()

      // Assert
      expect(result.status).toBe(HealthStatus.Unhealthy)
      expect(loggerMock.warn).toHaveBeenCalled()
    })
  })

  describe('determineOverallStatus', () => {
    it('should return degraded when memory usage is above threshold', () => {
      // Arrange
      const services = {
        api: { status: DependencyStatus.Up, duration: 100 },
        rabbit: { status: DependencyStatus.Up, duration: 200 },
      }
      const metrics: SystemMetrics = {
        memory: { total: 100, used: 95, free: 5, usagePercent: 95 },
        cpu: { usagePercent: 60, loadAvg: [1, 2, 3] },
      }

      // Act
      const result = service.determineOverallStatus(services, metrics)

      // Assert
      expect(result).toBe(HealthStatus.Degraded)
    })

    it('should return degraded when response time is above threshold', () => {
      // Arrange
      const services = {
        api: { status: DependencyStatus.Up, duration: 6000 },
        rabbit: { status: DependencyStatus.Up, duration: 200 },
      }
      const metrics: SystemMetrics = {
        memory: { total: 100, used: 70, free: 30, usagePercent: 70 },
        cpu: { usagePercent: 60, loadAvg: [1, 2, 3] },
      }

      // Act
      const result = service.determineOverallStatus(services, metrics)

      // Assert
      expect(result).toBe(HealthStatus.Degraded)
    })

    it('should return degraded when non-critical service is down', () => {
      // Arrange
      const services = {
        api: { status: DependencyStatus.Up, duration: 100 },
        rabbit: { status: DependencyStatus.Up, duration: 200 },
        nonCritical: { status: DependencyStatus.Down, duration: 100 },
      }
      const metrics: SystemMetrics = {
        memory: { total: 100, used: 70, free: 30, usagePercent: 70 },
        cpu: { usagePercent: 60, loadAvg: [1, 2, 3] },
      }

      // Act
      const result = service.determineOverallStatus(services, metrics)

      // Assert
      expect(result).toBe(HealthStatus.Degraded)
    })
  })
})
