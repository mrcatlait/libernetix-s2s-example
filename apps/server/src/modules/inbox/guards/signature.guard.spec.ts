import { ExecutionContext } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'crypto'

import { SignatureGuard } from './signature.guard'
import { InboxWebhookService } from '../services'

describe('SignatureGuard', () => {
  let guard: SignatureGuard
  let inboxWebhookServiceMock: { webhookPublicKey: string }
  let mockContext: ExecutionContext

  const mockBody = { test: 'data' }
  const mockSignature = 'validSignature'
  const mockPublicKey = 'mockPublicKey'

  beforeEach(async () => {
    inboxWebhookServiceMock = {
      webhookPublicKey: mockPublicKey,
    }

    const moduleRef = await Test.createTestingModule({
      providers: [SignatureGuard, { provide: InboxWebhookService, useValue: inboxWebhookServiceMock }],
    }).compile()

    guard = moduleRef.get(SignatureGuard)

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-signature': mockSignature },
          body: mockBody,
        }),
      }),
    } as ExecutionContext
  })

  describe('canActivate', () => {
    it('should return false when signature header is missing', () => {
      // Arrange
      const contextWithoutSignature = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
            body: mockBody,
          }),
        }),
      } as ExecutionContext

      // Act
      const result = guard.canActivate(contextWithoutSignature)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when signature is an array', () => {
      // Arrange
      const contextWithArraySignature = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { 'x-signature': ['sig1', 'sig2'] },
            body: mockBody,
          }),
        }),
      } as ExecutionContext

      // Act
      const result = guard.canActivate(contextWithArraySignature)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when body is missing', () => {
      // Arrange
      const contextWithoutBody = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { 'x-signature': mockSignature },
            body: null,
          }),
        }),
      } as ExecutionContext

      // Act
      const result = guard.canActivate(contextWithoutBody)

      // Assert
      expect(result).toBe(false)
    })

    it('should verify signature with crypto.verify', () => {
      // Arrange
      const verifyMock = vi.spyOn(crypto, 'verify').mockReturnValue(true as unknown as void)
      const expectedBuffer = Buffer.from(JSON.stringify(mockBody))

      // Act
      const result = guard.canActivate(mockContext)

      // Assert
      expect(result).toBe(true)
      expect(verifyMock).toHaveBeenCalledWith(
        'RSA-SHA256',
        expectedBuffer,
        mockPublicKey,
        Buffer.from(mockSignature, 'base64'),
      )
    })

    it('should return false when crypto.verify throws error', () => {
      // Arrange
      vi.spyOn(crypto, 'verify').mockImplementation(() => {
        throw new Error('Verification failed')
      })

      // Act
      const result = guard.canActivate(mockContext)

      // Assert
      expect(result).toBe(false)
    })
  })
})
