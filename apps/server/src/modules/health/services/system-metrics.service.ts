import { Injectable } from '@nestjs/common'
import * as os from 'os'

import { SystemMetrics } from '../models'

@Injectable()
export class SystemMetricsService {
  async getMetrics(): Promise<SystemMetrics> {
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory

    return {
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: (usedMemory / totalMemory) * 100,
      },
      cpu: {
        loadAvg: os.loadavg(),
        usagePercent: await this.getCpuUsage(),
      },
    }
  }

  async getCpuUsage(): Promise<number> {
    const startMeasurement = os.cpus().map((cpu) => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0),
    }))

    // Wait for 100ms to get a meaningful measurement
    await new Promise((resolve) => setTimeout(resolve, 100))

    const endMeasurement = os.cpus().map((cpu) => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0),
    }))

    const cpuUsage = startMeasurement.map((start, i) => {
      const end = endMeasurement[i]
      const idle = end.idle - start.idle
      const total = end.total - start.total
      return (1 - idle / total) * 100
    })

    return cpuUsage.reduce((acc, usage) => acc + usage, 0) / cpuUsage.length
  }
}
