import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { buildPaginationMeta } from '../../utils/pagination';
import type { CreateVehicleInput, UpdateVehicleInput, VehicleQueryInput } from './vehicles.validator';
import type { Prisma } from '@prisma/client';

export async function getVehicles(query: VehicleQueryInput) {
  const {
    page,
    limit,
    search,
    status,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    sortBy,
    order,
  } = query;

  const where: Prisma.VehicleWhereInput = {};

  // Search filter: make OR brand OR model OR vin contains search term
  if (search) {
    where.OR = [
      { make: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { vin: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (fuelType) {
    where.fuelType = fuelType;
  }

  if (transmission) {
    where.transmission = transmission;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (minYear !== undefined || maxYear !== undefined) {
    where.year = {};
    if (minYear !== undefined) {
      (where.year as Prisma.IntFilter).gte = minYear;
    }
    if (maxYear !== undefined) {
      (where.year as Prisma.IntFilter).lte = maxYear;
    }
  }

  const skip = (page - 1) * limit;

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.vehicle.count({ where }),
  ]);

  const meta = buildPaginationMeta(page, limit, total);

  return { vehicles, meta };
}

export async function getVehicleById(id: number) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

export async function createVehicle(data: CreateVehicleInput) {
  // Check VIN uniqueness
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { vin: data.vin },
  });

  if (existingVehicle) {
    throw new AppError('A vehicle with this VIN already exists', 409);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      make: data.make,
      brand: data.brand,
      model: data.model,
      year: data.year,
      vin: data.vin,
      colour: data.colour,
      mileage: data.mileage,
      fuelType: data.fuelType,
      transmission: data.transmission,
      price: data.price,
      status: data.status,
      images: data.images,
      description: data.description,
      specs: data.specs,
    },
  });

  return vehicle;
}

export async function updateVehicle(id: number, data: UpdateVehicleInput) {
  // Check vehicle exists
  const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!existingVehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // If VIN is being changed, check uniqueness
  if (data.vin && data.vin !== existingVehicle.vin) {
    const vinExists = await prisma.vehicle.findUnique({
      where: { vin: data.vin },
    });

    if (vinExists) {
      throw new AppError('A vehicle with this VIN already exists', 409);
    }
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data,
  });

  return vehicle;
}

export async function deleteVehicle(id: number) {
  // Check vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { sale: true },
  });

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Check no active sales (PENDING or NEGOTIATION are considered active)
  if (vehicle.sale && (vehicle.sale.status === 'PENDING' || vehicle.sale.status === 'NEGOTIATION')) {
    throw new AppError('Cannot delete a vehicle with an active sale', 400);
  }

  await prisma.vehicle.delete({ where: { id } });

  return { message: 'Vehicle deleted successfully' };
}
