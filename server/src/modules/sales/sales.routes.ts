import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { formatSuccess } from '../../utils/response';
import {
  createSaleSchema,
  updateSaleStatusSchema,
  salesQuerySchema,
} from './sales.validator';
import * as salesService from './sales.service';
import { UserRole } from '@prisma/client';

const router = Router();

// GET / — List sales with filters and pagination
router.get(
  '/',
  authenticate,
  validate(salesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const { sales, meta } = await salesService.getSales(query);
      res.json(formatSuccess(sales, meta));
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id — Get single sale
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const sale = await salesService.getSaleById(id);
      res.json(formatSuccess(sale));
    } catch (error) {
      next(error);
    }
  }
);

// POST / — Create sale
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(createSaleSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agentId = req.user!.userId;
      const sale = await salesService.createSale(req.body, agentId);
      res.status(201).json(formatSuccess(sale));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id/status — Update sale status
router.put(
  '/:id/status',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(updateSaleStatusSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const sale = await salesService.updateSaleStatus(id, req.body);
      res.json(formatSuccess(sale));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
