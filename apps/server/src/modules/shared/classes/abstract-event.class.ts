export abstract class AbstractEvent<T> {
  abstract readonly pattern: string

  readonly data: T

  constructor(payload: { data: T }) {
    this.data = payload.data
  }
}
