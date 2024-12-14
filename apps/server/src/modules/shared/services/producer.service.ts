import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ClientProxy, ClientProxyFactory, RmqRecordBuilder } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom, Observable } from 'rxjs'

import { rabbitMQConfig } from '../config'
import { EnvironmentVariables } from '../models'
import { AbstractEvent } from '../classes'

@Injectable()
export class ProducerService implements OnApplicationBootstrap {
  private readonly client: ClientProxy
  private readonly rmqUrl: string

  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
    this.rmqUrl = this.configService.get('RMQ_URL')
    this.client = ClientProxyFactory.create(rabbitMQConfig(this.rmqUrl))
  }

  async onApplicationBootstrap() {
    await this.client.connect()
  }

  async sendMessage<T extends AbstractEvent<unknown>>(event: T): Promise<void> {
    const record = new RmqRecordBuilder(event.data).build()

    return firstValueFrom(this.client.emit(event.pattern, record))
  }

  sendMessageObservable<T extends AbstractEvent<unknown>>(event: T): Observable<void> {
    const record = new RmqRecordBuilder(event.data).build()

    return this.client.emit(event.pattern, record)
  }
}
