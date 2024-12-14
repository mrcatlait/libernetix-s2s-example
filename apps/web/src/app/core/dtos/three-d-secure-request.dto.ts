export interface ThreeDSecureRequestDto {
  method: string
  url: string
  body?: {
    MD: string
    PaReq: string
    TermUrl: string
  }
}
