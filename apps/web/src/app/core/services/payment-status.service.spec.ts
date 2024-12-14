import { TestBed } from '@angular/core/testing'
import { Subject } from 'rxjs'

import { PaymentStatusService } from './payment-status.service'

import { PaymentRepository } from '@core/repositories'
import { PaymentStatusDto } from '@core/dtos'
import { PaymentStatus } from '@core/enums'

describe('PaymentStatusService', () => {
  let paymentStatusService: PaymentStatusService
  let paymentRepositoryMock: Partial<PaymentRepository>
  let paymentEventsSubject: Subject<PaymentStatusDto>

  beforeEach(() => {
    paymentEventsSubject = new Subject<PaymentStatusDto>()

    paymentRepositoryMock = {
      watchPaymentEvents: vi.fn().mockReturnValue(paymentEventsSubject),
    }

    TestBed.configureTestingModule({
      providers: [PaymentStatusService, { provide: PaymentRepository, useValue: paymentRepositoryMock }],
    })

    paymentStatusService = TestBed.inject(PaymentStatusService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('watchPaymentEvents', () => {
    it('should call repository watchPaymentEvents with provided purchaseId', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'

      // Act
      paymentStatusService.watchPaymentEvents(purchaseId)

      // Assert
      expect(paymentRepositoryMock.watchPaymentEvents).toHaveBeenCalledWith(purchaseId)
    })

    it('should update paymentStatus signal when new event is received', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'
      const paymentStatus: PaymentStatusDto = {
        status: PaymentStatus.Executed,
        purchaseId: 'test-purchase-id',
      }

      // Act
      paymentStatusService.watchPaymentEvents(purchaseId)
      paymentEventsSubject.next(paymentStatus)

      // Assert
      expect(paymentStatusService.paymentStatus()).toEqual(paymentStatus)
    })
  })

  describe('ngOnDestroy', () => {
    it('should not throw when no subscription exists', () => {
      // Act & Assert
      expect(() => paymentStatusService.ngOnDestroy()).not.toThrow()
    })
  })
})
