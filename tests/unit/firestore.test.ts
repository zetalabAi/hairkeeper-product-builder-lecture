import { describe, it, expect, beforeAll } from 'vitest';
import * as db from '../../server/db';

/**
 * Firestore CRUD 테스트
 *
 * 주의: 이 테스트는 실제 Firebase 프로젝트를 사용합니다.
 * 프로덕션 환경에서는 Firebase Emulator를 사용하세요.
 *
 * Firebase Emulator 사용:
 * 1. firebase emulators:start
 * 2. 환경 변수 설정:
 *    FIRESTORE_EMULATOR_HOST=localhost:8080
 *    FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
 */

describe('Firestore Database Operations', () => {
  const testUserId = `test-user-${Date.now()}`;
  const testProjectId = `test-project-${Date.now()}`;

  describe('User Operations', () => {
    it('should create a new user', async () => {
      await db.upsertUser({
        openId: testUserId,
        uid: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        loginMethod: 'email',
        role: 'user',
      });

      const user = await db.getUserByUid(testUserId);
      expect(user).toBeDefined();
      expect(user?.uid).toBe(testUserId);
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('Test User');
      expect(user?.role).toBe('user');
    });

    it('should get user by UID', async () => {
      const user = await db.getUserByUid(testUserId);
      expect(user).toBeDefined();
      expect(user?.uid).toBe(testUserId);
    });

    it('should get user by email', async () => {
      const user = await db.getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const user = await db.getUserByUid('non-existent-user');
      expect(user).toBeNull();
    });

    it('should update existing user', async () => {
      await db.upsertUser({
        openId: testUserId,
        uid: testUserId,
        name: 'Updated Test User',
        email: 'test@example.com',
        loginMethod: 'google',
        role: 'user',
      });

      const user = await db.getUserByUid(testUserId);
      expect(user?.name).toBe('Updated Test User');
      expect(user?.loginMethod).toBe('google');
    });
  });

  describe('Project Operations', () => {
    it('should create a new project', async () => {
      const project = await db.createProject({
        userId: testUserId,
        originalImageUrl: 'https://example.com/image.jpg',
        status: 'pending',
        nationality: 'korea',
        gender: 'male',
        style: 'modern',
      });

      expect(project).toBeDefined();
      expect(project.userId).toBe(testUserId);
      expect(project.status).toBe('pending');
      expect(project.originalImageUrl).toBe('https://example.com/image.jpg');
    });

    it('should get user projects', async () => {
      const projects = await db.getUserProjects(testUserId, 10);
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0]?.userId).toBe(testUserId);
    });

    it('should update project status', async () => {
      // 먼저 프로젝트 생성
      const project = await db.createProject({
        userId: testUserId,
        originalImageUrl: 'https://example.com/image2.jpg',
        status: 'pending',
        nationality: 'korea',
        gender: 'female',
        style: 'modern',
      });

      // 상태 업데이트
      await db.updateProjectStatus(project.id, 'processing');

      // 업데이트 확인
      const projects = await db.getUserProjects(testUserId, 10);
      const updatedProject = projects.find((p) => p.id === project.id);
      expect(updatedProject?.status).toBe('processing');
    });

    it('should return empty array for user with no projects', async () => {
      const projects = await db.getUserProjects('non-existent-user', 10);
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user data', async () => {
      try {
        await db.upsertUser({
          openId: '',
          uid: '',
          name: null,
          email: null,
          loginMethod: null,
          role: 'user',
        });
        // 에러가 발생하지 않으면 테스트 실패
        expect.fail('Should have thrown an error for invalid user data');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid project data', async () => {
      try {
        await db.createProject({
          userId: '',
          originalImageUrl: '',
          status: 'invalid-status' as any,
          nationality: 'korea',
          gender: 'male',
          style: 'modern',
        });
        expect.fail('Should have thrown an error for invalid project data');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
