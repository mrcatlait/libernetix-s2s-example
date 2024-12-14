import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { catchError, map, Observable, of, throwError } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { AxiosError } from 'axios'

import { InitiateS2SPaymentDto, S2SPayment3DSecurePayloadDto, S2SPaymentPayloadDto } from '../dtos'
import { S2SPaymentStatus } from '../enums'

import { EnvironmentVariables } from '@modules/shared/models'

@Injectable()
export class PaymentConnectorService {
  private readonly s2sToken = this.configService.get('S2S_TOKEN')

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  initiateS2SPayment(
    directPostUrl: string,
    initiateS2SPaymentDto: InitiateS2SPaymentDto,
  ): Observable<S2SPaymentPayloadDto | S2SPayment3DSecurePayloadDto> {
    return (
      this.httpService
        // API has broken routing and requires a trailing slash
        .post<S2SPaymentPayloadDto>(
          `${directPostUrl}?s2s=true`,
          {
            ...initiateS2SPaymentDto,
          },
          {
            headers: this.getS2SHeaders(),
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            if (error instanceof AxiosError) {
              const statusCode = error.response?.status
              const body = error.response?.data as S2SPaymentPayloadDto | undefined

              if (statusCode === 400 && body?.status === S2SPaymentStatus.Error) {
                return of(body)
              }
            }

            return throwError(() => error)
          }),
        )
    )
  }

  completeThreeDSecure(payload: { callbackUrl: string; MD?: string; PaRes: string }): Observable<S2SPaymentPayloadDto> {
    const formData = new URLSearchParams()

    if (payload.MD) {
      formData.append('MD', payload.MD)
    }

    formData.append('PaRes', payload.PaRes)

    return this.httpService
      .post<S2SPaymentPayloadDto>(payload.callbackUrl, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          if (error instanceof AxiosError) {
            const statusCode = error.response?.status
            const body = error.response?.data as S2SPaymentPayloadDto | undefined

            if (statusCode === 400 && body?.status === S2SPaymentStatus.Error) {
              return of(body)
            }
          }

          return throwError(() => error)
        }),
      )
  }

  private getS2SHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.s2sToken}`,
    }
  }
}
