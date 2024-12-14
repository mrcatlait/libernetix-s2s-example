import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'

import { Payment3DSecureService } from './payment-3d-secure.service'

import { ThreeDSecureRequestDto } from '@core/dtos'

describe('Payment3DSecureService', () => {
  let payment3DSecureService: Payment3DSecureService
  let httpClientMock: Partial<HttpClient>

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
      get: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    }

    TestBed.configureTestingModule({
      providers: [Payment3DSecureService, { provide: HttpClient, useValue: httpClientMock }],
    })

    payment3DSecureService = TestBed.inject(Payment3DSecureService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('start3DSecure', () => {
    it('should not make any HTTP request when request is undefined', () => {
      // Arrange
      const request = undefined

      // Act
      payment3DSecureService.start3DSecure(request)

      // Assert
      expect(httpClientMock.post).not.toHaveBeenCalled()
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })

    it('should make POST request when method is POST', () => {
      // Arrange
      const request: ThreeDSecureRequestDto = {
        method: 'POST',
        url: 'https://test.com',
        body: { MD: 'test', PaReq: 'test', TermUrl: 'test' },
      }

      // Act
      payment3DSecureService.start3DSecure(request)

      // Assert
      expect(httpClientMock.post).toHaveBeenCalledWith(request.url, request.body)
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })

    it('should make GET request when method is GET', () => {
      // Arrange
      const request: ThreeDSecureRequestDto = {
        method: 'GET',
        url: 'https://test.com',
      }

      // Act
      payment3DSecureService.start3DSecure(request)

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(request.url)
      expect(httpClientMock.post).not.toHaveBeenCalled()
    })
  })
})
