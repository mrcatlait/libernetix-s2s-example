import crypto from 'crypto'

export class SignatureMock {
  private readonly privateKey: string
  private readonly publicKey: string

  constructor() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    this.privateKey = privateKey
    this.publicKey = publicKey
  }

  base64Signature<T>(data: T): string {
    const bodyBuffer = Buffer.from(JSON.stringify(data))
    const signature = crypto.sign('RSA-SHA256', bodyBuffer, this.privateKey)
    return signature.toString('base64')
  }

  getPrivateKey(): string {
    return this.privateKey
  }

  getPublicKey(): string {
    return this.publicKey
  }
}
