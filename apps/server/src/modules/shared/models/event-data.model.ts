import { AbstractEvent } from '../classes'

export type EventData<T extends AbstractEvent<unknown>> = T['data']
