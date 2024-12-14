import { Logger, Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'

import { PaymentModule } from '../payment/payment.module'
import { HealthModule } from '../health/health.module'
import { TracingModule } from '../tracing/tracing.module'

import { Environment } from '@modules/shared/enums'
import { PurchaseModule } from '@modules/purchase/purchase.module'
import { SharedModule } from '@modules/shared/shared.module'
import { InboxModule } from '@modules/inbox/inbox.module'
import { EnvironmentVariables } from '@modules/shared/models'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid(Environment.Development, Environment.Production, Environment.Test)
          .default(Environment.Development),
        PORT: Joi.number().port().required(),
        SELF_URL: Joi.string().uri().required(),
        API_URL: Joi.string().uri().required(),
        API_KEY: Joi.string().required(),
        BRAND_ID: Joi.string().required(),
        S2S_TOKEN: Joi.string().required(),
        OTLP_EXPORTER_URL: Joi.string().uri(),
        JAEGER_UI_URL: Joi.string().uri().required(),
        SERVICE_NAME: Joi.string().required(),
        UI_URL: Joi.string().uri().required(),
        RMQ_URL: Joi.string().uri().required(),
        RMQ_METRICS_URL: Joi.string().uri().required(),
        MONGO_URI: Joi.string().uri().required(),
      }),
    }),
    EventEmitterModule.forRoot(),
    TracingModule,
    HealthModule,
    PaymentModule,
    PurchaseModule,
    SharedModule,
    InboxModule,
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 1000,
      },
    ]),
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [Logger],
})
export class AppModule {}
