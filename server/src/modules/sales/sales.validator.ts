import { z } from 'zod';
import { SaleStatus, PaymentMethod } from '@prisma/client';

export const createSaleSchema = z.object({
  vehicleId: z.number().int().positive('Vehicle ID is required'),
  customerId: z.number().int().positive('Customer ID is required'),
  salePrice: z.number().positive('Sale price must be a positive number'),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.FINANCE,
    PaymentMethod.CHEQUE,
  ]),
  notes: z.string().optional(),
});

export const updateSaleStatusSchema = z.object({
  status: z.enum([
    SaleStatus.PENDING,
    SaleStatus.NEGOTIATION,
    SaleStatus.COMPLETED,
    SaleStatus.CANCELLED,
  ]),
});

export const salesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z
    .enum([
      SaleStatus.PENDING,
      SaleStatus.NEGOTIATION,
      SaleStatus.COMPLETED,
      SaleStatus.CANCELLED,
    ])
    .optional(),
  agentId: z.coerce.number().int().positive().optional(),
  sortBy: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleStatusInput = z.infer<typeof updateSaleStatusSchema>;
export type SalesQueryInput = z.infer<typeof salesQuerySchema>;
