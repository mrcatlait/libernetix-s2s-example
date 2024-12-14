import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as os from 'os'

import { SystemMetricsService } from './system-metrics.service'

describe('SystemMetricsService', () => {
  vi.mock('os', () => ({
    totalmem: vi.fn(),
    freemem: vi.fn(),
    loadavg: vi.fn(),
    cpus: vi.fn(),
  }))

  let service: SystemMetricsService

  beforeEach(() => {
    service = new SystemMetricsService()
  })

  describe('getMetrics', () => {
    it('should return system metrics with memory and cpu usage', async () => {
      // Arrange
      const mockTotalMemory = 16000000000
      const mockFreeMemory = 8000000000
      const mockLoadAvg = [1.5, 1.2, 1.0]
      const mockCpuUsage = 25.5

      vi.spyOn(os, 'totalmem').mockReturnValue(mockTotalMemory)
      vi.spyOn(os, 'freemem').mockReturnValue(mockFreeMemory)
      vi.spyOn(os, 'loadavg').mockReturnValue(mockLoadAvg)
      vi.spyOn(service, 'getCpuUsage').mockResolvedValue(mockCpuUsage)

      // Act
      const result = await service.getMetrics()

      // Assert
      expect(result).toEqual({
        memory: {
          total: mockTotalMemory,
          used: mockTotalMemory - mockFreeMemory,
          free: mockFreeMemory,
          usagePercent: ((mockTotalMemory - mockFreeMemory) / mockTotalMemory) * 100,
        },
        cpu: {
          loadAvg: mockLoadAvg,
          usagePercent: mockCpuUsage,
        },
      })
    })
  })

  describe('getCpuUsage', () => {
    it('should calculate CPU usage percentage correctly', async () => {
      // Arrange
      const mockStartCpus = [
        {
          times: { idle: 1000, user: 500, nice: 100, sys: 200, irq: 50 },
        },
        {
          times: { idle: 1100, user: 600, nice: 150, sys: 250, irq: 75 },
        },
      ]

      const mockEndCpus = [
        {
          times: { idle: 1200, user: 700, nice: 150, sys: 300, irq: 100 },
        },
        {
          times: { idle: 1300, user: 800, nice: 200, sys: 350, irq: 125 },
        },
      ]

      vi.spyOn(os, 'cpus')
        .mockReturnValueOnce(mockStartCpus as os.CpuInfo[])
        .mockReturnValueOnce(mockEndCpus as os.CpuInfo[])

      vi.spyOn(global, 'setTimeout').mockImplementation((cb) => {
        cb()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return undefined as any
      })

      // Act
      const result = await service.getCpuUsage()

      // Assert
      // Calculate expected CPU usage
      const expectedUsages = mockStartCpus.map((start, i) => {
        const end = mockEndCpus[i]
        const startTotal = Object.values(start.times).reduce((acc, time) => acc + time, 0)
        const endTotal = Object.values(end.times).reduce((acc, time) => acc + time, 0)
        const idleDiff = end.times.idle - start.times.idle
        const totalDiff = endTotal - startTotal
        return (1 - idleDiff / totalDiff) * 100
      })
      const expectedAverage = expectedUsages.reduce((acc, usage) => acc + usage, 0) / expectedUsages.length

      expect(result).toBeCloseTo(expectedAverage, 2)
    })
  })
})
