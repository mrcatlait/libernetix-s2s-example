import { Global, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { SignatureGuard } from './guards'
import { InboxController } from './controllers'
import { InboxConnectorService, InboxService, InboxWebhookService } from './services'

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('API_URL'),
        headers: {
          Authorization: `Bearer ${configService.get('API_KEY')}`,
        },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [InboxController],
  providers: [InboxService, SignatureGuard, InboxConnectorService, InboxWebhookService],
  exports: [InboxConnectorService],
})
export class InboxModule {}
