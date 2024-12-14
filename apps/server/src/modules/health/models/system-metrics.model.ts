export interface SystemMetrics {
  memory: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
  cpu: {
    loadAvg: number[]
    usagePercent: number
  }
}
