import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { formatSuccess } from '../../utils/response';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from './customers.validator';
import * as customersService from './customers.service';
import { UserRole } from '@prisma/client';

const router = Router();

// GET / — List customers with search and pagination
router.get(
  '/',
  authenticate,
  validate(customerQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const { customers, meta } = await customersService.getCustomers(query);
      res.json(formatSuccess(customers, meta));
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id — Get single customer
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const customer = await customersService.getCustomerById(id);
      res.json(formatSuccess(customer));
    } catch (error) {
      next(error);
    }
  }
);

// POST / — Create customer
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(createCustomerSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customersService.createCustomer(req.body);
      res.status(201).json(formatSuccess(customer));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id — Update customer
router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(updateCustomerSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const customer = await customersService.updateCustomer(id, req.body);
      res.json(formatSuccess(customer));
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id — Delete customer
router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const result = await customersService.deleteCustomer(id);
      res.json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
