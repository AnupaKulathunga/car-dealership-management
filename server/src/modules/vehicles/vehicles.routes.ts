import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { formatSuccess } from '../../utils/response';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
} from './vehicles.validator';
import * as vehiclesService from './vehicles.service';
import { UserRole } from '@prisma/client';

const router = Router();

// GET / — List vehicles with filters and pagination
router.get(
  '/',
  authenticate,
  validate(vehicleQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const { vehicles, meta } = await vehiclesService.getVehicles(query);
      res.json(formatSuccess(vehicles, meta));
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id — Get single vehicle
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const vehicle = await vehiclesService.getVehicleById(id);
      res.json(formatSuccess(vehicle));
    } catch (error) {
      next(error);
    }
  }
);

// POST / — Create vehicle
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT, UserRole.INVENTORY_STAFF),
  validate(createVehicleSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehiclesService.createVehicle(req.body);
      res.status(201).json(formatSuccess(vehicle));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id — Update vehicle
router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT, UserRole.INVENTORY_STAFF),
  validate(updateVehicleSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const vehicle = await vehiclesService.updateVehicle(id, req.body);
      res.json(formatSuccess(vehicle));
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id — Delete vehicle (ADMIN only)
router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const result = await vehiclesService.deleteVehicle(id);
      res.json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
