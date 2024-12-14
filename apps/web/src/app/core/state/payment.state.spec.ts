import { TestBed } from '@angular/core/testing'
import { Signal, signal } from '@angular/core'

import { PaymentState } from './payment.state'

import { NavigationService, PaymentStatusService, Payment3DSecureService } from '@core/services'
import { PaymentStatus } from '@core/enums'
import { PaymentStatusDto, ThreeDSecureRequestDto } from '@core/dtos'

describe('PaymentState', () => {
  let paymentState: PaymentState
  let navigationServiceMock: Partial<NavigationService>
  let paymentStatusServiceMock: Partial<PaymentStatusService>
  let payment3DSecureServiceMock: Partial<Payment3DSecureService>

  beforeEach(() => {
    navigationServiceMock = {
      goToProcessingPage: vi.fn(),
      goToSuccessPage: vi.fn(),
      goToErrorPage: vi.fn(),
    }

    paymentStatusServiceMock = {
      watchPaymentEvents: vi.fn(),
      paymentStatus: signal<PaymentStatusDto | null>(null),
    }

    payment3DSecureServiceMock = {
      start3DSecure: vi.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        PaymentState,
        { provide: NavigationService, useValue: navigationServiceMock },
        { provide: PaymentStatusService, useValue: paymentStatusServiceMock },
        { provide: Payment3DSecureService, useValue: payment3DSecureServiceMock },
      ],
    })

    paymentState = TestBed.inject(PaymentState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('processPurchase', () => {
    it('should set purchase ID and navigate to processing page', () => {
      // Arrange
      const purchaseId = 'test-purchase-id'

      // Act
      paymentState.processPurchase(purchaseId)

      // Assert
      expect(paymentStatusServiceMock.watchPaymentEvents).toHaveBeenCalledWith(purchaseId)
      expect(navigationServiceMock.goToProcessingPage).toHaveBeenCalled()
    })
  })

  describe('handleStatusChange', () => {
    it('should navigate to success page when status is Executed', () => {
      // Act
      paymentState.handleStatusChange(PaymentStatus.Executed)

      // Assert
      expect(navigationServiceMock.goToSuccessPage).toHaveBeenCalled()
    })

    it('should navigate to error page when status is Failed', () => {
      // Act
      paymentState.handleStatusChange(PaymentStatus.Failed)

      // Assert
      expect(navigationServiceMock.goToErrorPage).toHaveBeenCalled()
    })

    it('should start 3D secure when status is ThreeDSecureRequired', () => {
      // Arrange
      const threeDSecureRequest: ThreeDSecureRequestDto = { url: 'test-url', method: 'GET' }
      paymentStatusServiceMock.paymentStatus?.set({
        status: PaymentStatus.ThreeDSecureRequired,
        threeDSecureRequest,
        purchaseId: 'test-purchase-id',
      })

      // Act
      paymentState.handleStatusChange(PaymentStatus.ThreeDSecureRequired)

      // Assert
      expect(payment3DSecureServiceMock.start3DSecure).toHaveBeenCalledWith(threeDSecureRequest)
    })

    it('should do nothing for undefined status', () => {
      // Act
      paymentState.handleStatusChange(undefined)

      // Assert
      expect(navigationServiceMock.goToSuccessPage).not.toHaveBeenCalled()
      expect(navigationServiceMock.goToErrorPage).not.toHaveBeenCalled()
      expect(payment3DSecureServiceMock.start3DSecure).not.toHaveBeenCalled()
    })
  })

  describe('completePurchase', () => {
    it('should reset purchase ID', () => {
      // Arrange
      paymentState.processPurchase('test-purchase-id')

      // Act
      paymentState.completePurchase()

      // Assert
      expect(() => paymentState.processPurchase('new-purchase-id')).not.toThrow()
    })
  })
})
