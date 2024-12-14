import { NestFactory, Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ClassSerializerInterceptor, VersioningType, ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { utilities, WinstonModule } from 'nest-winston'
import { createLogger, format, transports } from 'winston'

import { AppModule } from './modules/app/app.module'
import { setupSwagger } from './util'
import { OpenTelemetryService } from './modules/tracing/services'

import { rabbitMQConfig } from '@modules/shared/config'
import { EnvironmentVariables } from '@modules/shared/models'

const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        utilities.format.nestLike('', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  })

  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService)
  const PORT = configService.get('PORT', { infer: true })
  const UI_URL = configService.get('UI_URL', { infer: true })
  const RMQ_URL = configService.get('RMQ_URL', { infer: true })

  app.connectMicroservice(rabbitMQConfig(RMQ_URL))

  const openTelemetryService = app.get(OpenTelemetryService)
  openTelemetryService.start()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  const reflector = app.get(Reflector)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector))

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
    }),
  )

  app.enableCors({
    origin: UI_URL,
    credentials: true,
  })

  app.enableVersioning({
    type: VersioningType.URI,
  })

  setupSwagger(app)

  await app.startAllMicroservices()
  await app.listen(PORT)

  logger.info(`Server started on ${PORT}`)
}

bootstrap().catch((error) => {
  logger.error(error)
  process.exit(1)
})
