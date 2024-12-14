export class CreatePurchaseDto {
  client: {
    email: string
  }
  purchase: {
    // ISO 4217
    currency: string
    products: Array<{
      name: string
      price: number
    }>
  }
  success_redirect: string
  failure_redirect: string
  brand_id: string
}
