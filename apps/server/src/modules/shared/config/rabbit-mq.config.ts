import { Transport, RmqOptions } from '@nestjs/microservices'

export const rabbitMQConfig = (rmqUrl: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [rmqUrl],
    queue: 'payment_queue',
    queueOptions: {
      durable: true,
    },
    // noAck: false,
    prefetchCount: 1,
    maxConnectionAttempts: 5,
  },
})
