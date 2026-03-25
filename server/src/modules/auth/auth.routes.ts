import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { formatSuccess } from '../../utils/response';
import { loginSchema, registerSchema, refreshSchema } from './auth.validator';
import * as authService from './auth.service';
import { UserRole } from '@prisma/client';

const router = Router();

// POST /login
router.post(
  '/login',
  validate(loginSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }
);

// POST /register — ADMIN only
router.post(
  '/register',
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(registerSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(formatSuccess(user));
    } catch (error) {
      next(error);
    }
  }
);

// POST /refresh
router.post(
  '/refresh',
  validate(refreshSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json(formatSuccess(tokens));
    } catch (error) {
      next(error);
    }
  }
);

// GET /me
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile((req as any).user.userId);
      res.json(formatSuccess(user));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
