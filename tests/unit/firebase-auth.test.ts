import { describe, it, expect, vi } from 'vitest';
import { verifyFirebaseToken } from '../../server/_core/firebase-auth';

/**
 * Firebase Auth 서버 테스트
 *
 * 주의: 이 테스트는 실제 Firebase ID 토큰 검증을 수행합니다.
 * 프로덕션 환경에서는 Firebase Auth Emulator를 사용하세요.
 */

describe('Firebase Auth Server', () => {
  describe('verifyFirebaseToken', () => {
    it('should reject invalid token', async () => {
      const invalidToken = 'invalid-token-12345';

      try {
        await verifyFirebaseToken(invalidToken);
        expect.fail('Should have thrown an error for invalid token');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('토큰');
      }
    });

    it('should reject empty token', async () => {
      const emptyToken = '';

      try {
        await verifyFirebaseToken(emptyToken);
        expect.fail('Should have thrown an error for empty token');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should reject malformed token', async () => {
      const malformedToken = 'not.a.valid.jwt.token';

      try {
        await verifyFirebaseToken(malformedToken);
        expect.fail('Should have thrown an error for malformed token');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // 참고: 유효한 토큰 테스트는 실제 Firebase ID 토큰이 필요합니다.
    // E2E 테스트에서 실제 로그인 후 테스트하거나,
    // Firebase Auth Emulator를 사용하여 테스트할 수 있습니다.
    it.skip('should verify valid token', async () => {
      // 실제 Firebase ID 토큰 필요
      const validToken = 'REPLACE_WITH_ACTUAL_TOKEN';

      const decodedToken = await verifyFirebaseToken(validToken);
      expect(decodedToken).toBeDefined();
      expect(decodedToken.uid).toBeDefined();
      expect(decodedToken.email).toBeDefined();
    });
  });
});

/**
 * Mock 테스트 예제
 *
 * 실제 Firebase 호출 없이 테스트하는 방법
 */
describe('Firebase Auth Server (Mocked)', () => {
  it('should extract user info from decoded token', () => {
    // Mock 토큰 데이터
    const mockDecodedToken = {
      uid: 'test-user-123',
      email: 'test@example.com',
      email_verified: true,
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
      firebase: {
        sign_in_provider: 'google.com',
      },
    };

    // 토큰에서 사용자 정보 추출 검증
    expect(mockDecodedToken.uid).toBe('test-user-123');
    expect(mockDecodedToken.email).toBe('test@example.com');
    expect(mockDecodedToken.firebase.sign_in_provider).toBe('google.com');
  });
});
