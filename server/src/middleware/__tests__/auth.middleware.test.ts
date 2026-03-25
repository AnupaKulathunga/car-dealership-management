import type { Request, Response, NextFunction } from 'express';

// ── Mocks ──────────────────────────────────────────────────────────────

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../config/env', () => ({
  env: {
    jwtSecret: 'test-jwt-secret',
  },
}));

// ── Imports ────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import { authenticate } from '../auth.middleware';
import { requireRole } from '../role.middleware';

// ── Helpers ────────────────────────────────────────────────────────────

function createMockReqResNext() {
  const req = {
    headers: {},
    user: undefined,
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── authenticate ───────────────────────────────────────────────────

  describe('authenticate', () => {
    it('should call next() and attach user when token is valid', () => {
      const { req, res, next } = createMockReqResNext();
      req.headers.authorization = 'Bearer valid-token';

      const decoded = { userId: 1, email: 'john@example.com', role: 'SALES_AGENT' };
      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      const { req, res, next } = createMockReqResNext();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      const { req, res, next } = createMockReqResNext();
      req.headers.authorization = 'Bearer invalid-token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Invalid or expired token' }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── requireRole ────────────────────────────────────────────────────

  describe('requireRole', () => {
    it('should call next() when user has the required role', () => {
      const { req, res, next } = createMockReqResNext();
      req.user = { userId: 1, email: 'admin@example.com', role: 'ADMIN' as any };

      const middleware = requireRole('ADMIN' as any);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user does not have the required role', () => {
      const { req, res, next } = createMockReqResNext();
      req.user = { userId: 1, email: 'agent@example.com', role: 'SALES_AGENT' as any };

      const middleware = requireRole('ADMIN' as any);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Insufficient permissions' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is attached to request', () => {
      const { req, res, next } = createMockReqResNext();
      // req.user is undefined

      const middleware = requireRole('ADMIN' as any);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
