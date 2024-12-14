import { PurchaseDto } from '../dto'
import { Purchase } from '../models'

export const mapPurchaseDtoToModel = (dto: PurchaseDto): Purchase => ({
  id: dto.id,
  directPostUrl: dto.direct_post_url,
})
