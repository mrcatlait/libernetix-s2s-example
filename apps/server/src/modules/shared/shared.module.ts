import { Module, Global } from '@nestjs/common'

import { ProducerService } from './services'

@Global()
@Module({
  providers: [ProducerService],
  exports: [ProducerService],
})
export class SharedModule {}
