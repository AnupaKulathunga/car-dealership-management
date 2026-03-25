import { AppError } from '../../../utils/AppError';

// ── Mocks ──────────────────────────────────────────────────────────────

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../../config/env', () => ({
  env: {
    nodeEnv: 'test',
  },
}));

// ── Imports ────────────────────────────────────────────────────────────

import { prisma } from '../../../lib/prisma';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../vehicles.service';

// ── Helpers ────────────────────────────────────────────────────────────

const mockVehicle = {
  id: 1,
  make: 'Toyota',
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  vin: '1HGBH41JXMN109186',
  colour: 'White',
  mileage: 15000,
  fuelType: 'PETROL',
  transmission: 'AUTOMATIC',
  price: 35000,
  status: 'AVAILABLE',
  images: [],
  description: 'A reliable sedan',
  specs: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// ── Tests ──────────────────────────────────────────────────────────────

describe('Vehicles Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getVehicles ────────────────────────────────────────────────────

  describe('getVehicles', () => {
    it('should return paginated vehicle results', async () => {
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue([mockVehicle]);
      (prisma.vehicle.count as jest.Mock).mockResolvedValue(1);

      const result = await getVehicles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(result.vehicles).toHaveLength(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should apply search filter across make, brand, model, and vin', async () => {
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue([mockVehicle]);
      (prisma.vehicle.count as jest.Mock).mockResolvedValue(1);

      await getVehicles({
        page: 1,
        limit: 10,
        search: 'Toyota',
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { make: { contains: 'Toyota', mode: 'insensitive' } },
              { brand: { contains: 'Toyota', mode: 'insensitive' } },
              { model: { contains: 'Toyota', mode: 'insensitive' } },
              { vin: { contains: 'Toyota', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  // ── getVehicleById ─────────────────────────────────────────────────

  describe('getVehicleById', () => {
    it('should return the vehicle when found', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);

      const result = await getVehicleById(1);

      expect(result).toEqual(mockVehicle);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw 404 when vehicle does not exist', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getVehicleById(999)).rejects.toThrow(AppError);
      await expect(getVehicleById(999)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── createVehicle ──────────────────────────────────────────────────

  describe('createVehicle', () => {
    const createInput = {
      make: 'Honda',
      brand: 'Honda',
      model: 'Civic',
      year: 2024,
      vin: '2HGFC2F59MH123456',
      colour: 'Blue',
      mileage: 0,
      fuelType: 'PETROL' as const,
      transmission: 'AUTOMATIC' as const,
      price: 28000,
      status: 'AVAILABLE' as const,
      images: [],
      description: 'Brand new Civic',
    };

    it('should create and return a vehicle', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.vehicle.create as jest.Mock).mockResolvedValue({
        id: 2,
        ...createInput,
        specs: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createVehicle(createInput);

      expect(result.id).toBe(2);
      expect(result.model).toBe('Civic');
      expect(prisma.vehicle.create).toHaveBeenCalled();
    });

    it('should throw 409 when VIN already exists', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);

      await expect(createVehicle(createInput)).rejects.toThrow(AppError);
      await expect(createVehicle(createInput)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ── updateVehicle ──────────────────────────────────────────────────

  describe('updateVehicle', () => {
    it('should update and return the vehicle', async () => {
      const updatedVehicle = { ...mockVehicle, colour: 'Red' };
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
      (prisma.vehicle.update as jest.Mock).mockResolvedValue(updatedVehicle);

      const result = await updateVehicle(1, { colour: 'Red' });

      expect(result.colour).toBe('Red');
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { colour: 'Red' },
      });
    });
  });

  // ── deleteVehicle ──────────────────────────────────────────────────

  describe('deleteVehicle', () => {
    it('should delete the vehicle when no active sale exists', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({
        ...mockVehicle,
        sale: null,
      });
      (prisma.vehicle.delete as jest.Mock).mockResolvedValue(mockVehicle);

      const result = await deleteVehicle(1);

      expect(result.message).toBe('Vehicle deleted successfully');
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw 400 when vehicle has an active sale', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({
        ...mockVehicle,
        sale: { id: 1, status: 'PENDING' },
      });

      await expect(deleteVehicle(1)).rejects.toThrow(AppError);
      await expect(deleteVehicle(1)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });
});
