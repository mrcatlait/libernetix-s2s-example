import { DependencyStatus } from '../enums'

export interface ServiceHealth {
  status: DependencyStatus
  duration: number
  error?: string
}
