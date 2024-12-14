import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { map, Observable } from 'rxjs'

import { CreatePurchaseDto, PurchaseDto } from '../dto'
import { Purchase } from '../models'
import { mapPurchaseDtoToModel } from '../mappers'

@Injectable()
export class PurchaseConnectorService {
  constructor(private readonly httpService: HttpService) {}

  createPurchase(createPurchaseDto: CreatePurchaseDto): Observable<Purchase> {
    return (
      this.httpService
        // API has broken routing and requires a trailing slash in the end
        .post<PurchaseDto>(`/purchases/`, {
          ...createPurchaseDto,
        })
        .pipe(map((response) => mapPurchaseDtoToModel(response.data)))
    )
  }

  getPurchase(purchaseId: string): Observable<Purchase> {
    return (
      this.httpService
        // API has broken routing and requires a trailing slash in the end
        .get<PurchaseDto>(`/purchases/${purchaseId}/`)
        .pipe(map((response) => mapPurchaseDtoToModel(response.data)))
    )
  }

  cancelPurchase(purchaseId: string): Observable<Purchase> {
    return (
      this.httpService
        // API has broken routing and requires a trailing slash in the end
        .post<PurchaseDto>(`/purchases/${purchaseId}/cancel/`)
        .pipe(map((response) => mapPurchaseDtoToModel(response.data)))
    )
  }
}
