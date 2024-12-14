import nock from 'nock'
import { RabbitMQContainer, StartedRabbitMQContainer } from '@testcontainers/rabbitmq'
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb'

export let rabbitMQContainer: StartedRabbitMQContainer
export let mongoContainer: StartedMongoDBContainer

beforeAll(async () => {
  nock.disableNetConnect()
  // Allow localhost connections for test server
  const matchPattern = [/127\.0\.0\.1/, /localhost/, /mongodb/, /amqp/]
  nock.enableNetConnect((host) => matchPattern.some((pattern) => pattern.test(host)))

  // Start containers
  ;[rabbitMQContainer, mongoContainer] = await Promise.all([
    new RabbitMQContainer().start(),
    new MongoDBContainer().start(),
  ])
})

afterAll(() => {
  nock.cleanAll()
  nock.enableNetConnect()
})

afterEach(() => {
  nock.cleanAll()
})
