import { z } from 'zod';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export const createAppointmentSchema = z.object({
  customerId: z.number().int().positive('Customer ID is required'),
  vehicleId: z.number().int().positive('Vehicle ID is required').optional(),
  type: z.enum([AppointmentType.TEST_DRIVE, AppointmentType.CONSULTATION]),
  dateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .refine((val) => new Date(val) > new Date(), {
      message: 'Appointment date must be in the future',
    }),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ]),
});

export const appointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z
    .enum([
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ])
    .optional(),
  type: z.enum([AppointmentType.TEST_DRIVE, AppointmentType.CONSULTATION]).optional(),
  agentId: z.coerce.number().int().positive().optional(),
  sortBy: z.string().optional().default('dateTime'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type AppointmentsQueryInput = z.infer<typeof appointmentsQuerySchema>;
