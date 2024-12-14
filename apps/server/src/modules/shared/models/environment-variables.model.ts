import { Environment } from '../enums'

export interface EnvironmentVariables {
  PORT: number
  NODE_ENV: Environment
  API_URL: string
  SELF_URL: string
  API_KEY: string
  S2S_TOKEN: string
  BRAND_ID: string
  RMQ_URL: string
  RMQ_METRICS_URL: string
  OTLP_EXPORTER_URL?: string
  JAEGER_UI_URL: string
  SERVICE_NAME: string
  UI_URL: string
  MONGO_URI: string
}
