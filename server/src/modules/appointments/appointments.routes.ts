import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { formatSuccess } from '../../utils/response';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  appointmentsQuerySchema,
} from './appointments.validator';
import * as appointmentsService from './appointments.service';
import { UserRole } from '@prisma/client';

const router = Router();

// GET / — List appointments with filters and pagination
router.get(
  '/',
  authenticate,
  validate(appointmentsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const { appointments, meta } = await appointmentsService.getAppointments(
        query,
        req.user?.userId,
        req.user?.role
      );
      res.json(formatSuccess(appointments, meta));
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id — Get single appointment
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const appointment = await appointmentsService.getAppointmentById(id);
      res.json(formatSuccess(appointment));
    } catch (error) {
      next(error);
    }
  }
);

// POST / — Create appointment
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(createAppointmentSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agentId = req.user!.userId;
      const appointment = await appointmentsService.createAppointment(req.body, agentId);
      res.status(201).json(formatSuccess(appointment));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id/status — Update appointment status
router.put(
  '/:id/status',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT),
  validate(updateAppointmentStatusSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const appointment = await appointmentsService.updateAppointmentStatus(id, req.body);
      res.json(formatSuccess(appointment));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
