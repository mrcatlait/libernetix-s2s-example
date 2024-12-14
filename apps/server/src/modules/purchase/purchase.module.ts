import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { PurchaseConnectorService, PurchaseService } from './services'

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
  controllers: [],
  providers: [PurchaseConnectorService, PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
