import { Test } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi, PartiallyMocked } from 'vitest'
import { AxiosResponse } from 'axios'

import { ServiceMetricsService } from './service-metrics.service'
import { DependencyStatus } from '../enums/dependency-status.enum'

import { InboxConnectorService } from '@modules/inbox/services'

describe('ServiceMetricsService', () => {
  let service: ServiceMetricsService
  let httpServiceMock: PartiallyMocked<HttpService>
  let configServiceMock: PartiallyMocked<ConfigService>
  let inboxConnectorServiceMock: PartiallyMocked<InboxConnectorService>
  let loggerMock: PartiallyMocked<Logger>

  const mockConfig = {
    JAEGER_UI_URL: 'http://jaeger.test',
    RMQ_METRICS_URL: 'http://rabbit.test',
  }

  beforeEach(async () => {
    httpServiceMock = {
      get: vi.fn(),
    }

    inboxConnectorServiceMock = {
      getPublicKey: vi.fn(),
    }

    configServiceMock = {
      get: vi.fn((key: string) => mockConfig[key]),
    }

    loggerMock = {
      error: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        ServiceMetricsService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: InboxConnectorService, useValue: inboxConnectorServiceMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile()

    service = moduleRef.get<ServiceMetricsService>(ServiceMetricsService)
  })

  describe('checkServices', () => {
    it('should return all services as up when all checks pass', async () => {
      // Arrange
      httpServiceMock.get?.mockReturnValue(of({ data: {} } as AxiosResponse))
      inboxConnectorServiceMock.getPublicKey?.mockReturnValue(of('public_key'))
      vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(100)

      // Act
      const result = await service.checkServices()

      // Assert
      expect(result.api.status).toBe(DependencyStatus.Up)
      expect(result.jaeger.status).toBe(DependencyStatus.Up)
      expect(result.rabbit.status).toBe(DependencyStatus.Up)
      expect(result.api.duration).toBeGreaterThanOrEqual(0)
      expect(result.api.error).toBeUndefined()
    })

    it('should mark service as down when check fails', async () => {
      // Arrange
      httpServiceMock.get?.mockImplementation((url) => {
        if (url === mockConfig.JAEGER_UI_URL) {
          return throwError(() => new Error('Connection refused'))
        }
        return of({ data: {} } as AxiosResponse)
      })
      inboxConnectorServiceMock.getPublicKey?.mockImplementation(() =>
        throwError(() => new Error('Connection refused')),
      )
      vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(100)

      // Act
      const result = await service.checkServices()

      // Assert
      expect(result.api.status).toBe(DependencyStatus.Down)
      expect(result.api.error).toBe('Connection refused')
      expect(result.jaeger.status).toBe(DependencyStatus.Down)
      expect(result.rabbit.status).toBe(DependencyStatus.Up)
      expect(loggerMock.error).toHaveBeenCalledWith('Health check failed for api', 'Connection refused')
    })

    it('should handle unknown errors', async () => {
      // Arrange
      httpServiceMock.get?.mockImplementation(() => throwError(() => 'Unknown error'))
      inboxConnectorServiceMock.getPublicKey?.mockImplementation(() => throwError(() => 'Unknown error'))
      vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(100)

      // Act
      const result = await service.checkServices()

      // Assert
      expect(result.api.status).toBe(DependencyStatus.Down)
      expect(result.api.error).toBe('Unknown error')
      expect(loggerMock.error).toHaveBeenCalledWith('Health check failed for api', 'Unknown error')
    })
  })
})
