import { z } from 'zod';
import { VehicleStatus, FuelType, Transmission } from '@prisma/client';

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(2030, 'Year must be 2030 or earlier'),
  vin: z.string().min(1, 'VIN is required').max(17, 'VIN must be at most 17 characters'),
  colour: z.string().min(1, 'Colour is required'),
  mileage: z.number().int().min(0, 'Mileage must be 0 or greater'),
  fuelType: z.enum([FuelType.PETROL, FuelType.DIESEL, FuelType.HYBRID, FuelType.ELECTRIC]),
  transmission: z.enum([Transmission.MANUAL, Transmission.AUTOMATIC]),
  price: z.number().positive('Price must be a positive number'),
  status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.RESERVED, VehicleStatus.SOLD]).optional().default(VehicleStatus.AVAILABLE),
  images: z.any().optional(),
  description: z.string().optional(),
  specs: z.any().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.RESERVED, VehicleStatus.SOLD]).optional(),
  fuelType: z.enum([FuelType.PETROL, FuelType.DIESEL, FuelType.HYBRID, FuelType.ELECTRIC]).optional(),
  transmission: z.enum([Transmission.MANUAL, Transmission.AUTOMATIC]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  sortBy: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;
