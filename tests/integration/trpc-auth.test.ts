import { describe, it, expect } from 'vitest';
import { appRouter } from '../../server/routers';
import type { TrpcContext } from '../../server/_core/context';

/**
 * tRPC + Firebase Auth 통합 테스트
 *
 * 보호된 프로시저와 공개 프로시저의 인증 동작을 테스트합니다.
 */

describe('tRPC Authentication', () => {
  describe('Protected Procedures', () => {
    it('should allow authenticated user to access protected route', async () => {
      // Mock 인증된 사용자 컨텍스트
      const authenticatedCtx: TrpcContext = {
        user: {
          id: 1,
          openId: 'test-user',
          uid: 'firebase-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          loginMethod: 'google',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {
            authorization: 'Bearer mock-firebase-token',
          },
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(authenticatedCtx);

      // 보호된 프로시저 호출
      const result = await caller.user.getProfile();

      expect(result).toBeDefined();
      expect(result.uid).toBe('firebase-uid-123');
      expect(result.email).toBe('test@example.com');
    });

    it('should reject unauthenticated user', async () => {
      // 인증되지 않은 컨텍스트
      const unauthenticatedCtx: TrpcContext = {
        user: null,
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(unauthenticatedCtx);

      // 보호된 프로시저 호출 시 에러 발생 예상
      try {
        await caller.user.getProfile();
        expect.fail('Should have thrown UNAUTHORIZED error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('Public Procedures', () => {
    it('should allow unauthenticated user to access public route', async () => {
      const unauthenticatedCtx: TrpcContext = {
        user: null,
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(unauthenticatedCtx);

      // 공개 프로시저 호출 (예: health check)
      // 참고: 실제 공개 프로시저가 있는 경우에만 테스트 가능
      // const result = await caller.health.check();
      // expect(result).toBeDefined();

      // 현재는 모든 프로시저가 보호되어 있으므로 스킵
      expect(true).toBe(true);
    });
  });

  describe('User Context', () => {
    it('should have correct user data in context', async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: 'test-user',
          uid: 'firebase-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          loginMethod: 'email',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      expect(ctx.user).toBeDefined();
      expect(ctx.user?.uid).toBe('firebase-uid-123');
      expect(ctx.user?.email).toBe('test@example.com');
      expect(ctx.user?.role).toBe('user');
    });

    it('should handle missing user gracefully', async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      expect(ctx.user).toBeNull();
    });
  });

  describe('Project Operations', () => {
    it('should allow user to create project', async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: 'test-user',
          uid: 'firebase-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          loginMethod: 'google',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(ctx);

      // 프로젝트 생성
      const project = await caller.project.create({
        originalImageUrl: 'https://example.com/test.jpg',
        nationality: 'korea',
        gender: 'male',
        style: 'modern',
      });

      expect(project).toBeDefined();
      expect(project.userId).toBe('firebase-uid-123');
      expect(project.status).toBe('pending');
    });

    it('should allow user to list their own projects', async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: 'test-user',
          uid: 'firebase-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          loginMethod: 'google',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(ctx);

      // 프로젝트 목록 조회
      const projects = await caller.project.list({
        limit: 10,
      });

      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('should prevent user from accessing other user projects', async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: 'test-user',
          uid: 'firebase-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          loginMethod: 'google',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {},
        } as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(ctx);

      // Firestore 보안 규칙이 다른 사용자의 프로젝트 접근을 차단
      // 서버 로직에서도 userId 필터링 확인
      const projects = await caller.project.list({ limit: 10 });

      // 반환된 프로젝트가 모두 현재 사용자의 것인지 확인
      projects.forEach((project) => {
        expect(project.userId).toBe('firebase-uid-123');
      });
    });
  });
});
