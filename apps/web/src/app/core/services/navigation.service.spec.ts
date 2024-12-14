import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'

import { NavigationService } from './navigation.service'

describe('NavigationService', () => {
  let navigationService: NavigationService
  let routerMock: Partial<Router>

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    }

    TestBed.configureTestingModule({
      providers: [NavigationService, { provide: Router, useValue: routerMock }],
    })

    navigationService = TestBed.inject(NavigationService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('goToHomePage', () => {
    it('should navigate to home page', () => {
      // Arrange
      const expectedPath = ['/']

      // Act
      navigationService.goToHomePage()

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(expectedPath)
    })
  })

  describe('goToProcessingPage', () => {
    it('should navigate to processing page', () => {
      // Arrange
      const expectedPath = ['/processing']

      // Act
      navigationService.goToProcessingPage()

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(expectedPath)
    })
  })

  describe('goToErrorPage', () => {
    it('should navigate to error page', () => {
      // Arrange
      const expectedPath = ['/error']

      // Act
      navigationService.goToErrorPage()

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(expectedPath)
    })
  })

  describe('goToSuccessPage', () => {
    it('should navigate to success page', () => {
      // Arrange
      const expectedPath = ['/success']

      // Act
      navigationService.goToSuccessPage()

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(expectedPath)
    })
  })
})
