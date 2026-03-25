import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { buildPaginationMeta } from '../../utils/pagination';
import type { CreateSaleInput, UpdateSaleStatusInput, SalesQueryInput } from './sales.validator';
import type { Prisma } from '@prisma/client';

export async function getSales(query: SalesQueryInput) {
  const { page, limit, status, agentId, sortBy, order } = query;

  const where: Prisma.SaleWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (agentId) {
    where.agentId = agentId;
  }

  const skip = (page - 1) * limit;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        vehicle: { select: { make: true, brand: true, model: true } },
        customer: { select: { firstName: true, lastName: true } },
        agent: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.sale.count({ where }),
  ]);

  const meta = buildPaginationMeta(page, limit, total);

  return { sales, meta };
}

export async function getSaleById(id: number) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: true,
      agent: { select: { id: true, firstName: true, lastName: true, email: true } },
      invoice: true,
    },
  });

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  return sale;
}

export async function createSale(data: CreateSaleInput, agentId: number) {
  // Check vehicle exists and is available
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicle.status !== 'AVAILABLE') {
    throw new AppError('Vehicle is not available for sale', 400);
  }

  // Check customer exists
  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Use transaction for atomicity
  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        agentId,
        salePrice: data.salePrice,
        saleDate: new Date(),
        paymentMethod: data.paymentMethod,
        status: 'PENDING',
        notes: data.notes,
      },
    });

    // Reserve the vehicle
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'RESERVED' },
    });

    return newSale;
  });

  return sale;
}

export async function updateSaleStatus(id: number, { status: newStatus }: UpdateSaleStatusInput) {
  const sale = await prisma.sale.findUnique({ where: { id } });

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ['NEGOTIATION', 'CANCELLED'],
    NEGOTIATION: ['COMPLETED', 'CANCELLED'],
  };

  const allowed = validTransitions[sale.status];

  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition sale status from ${sale.status} to ${newStatus}`,
      400
    );
  }

  // Use transaction for multi-table updates
  const updatedSale = await prisma.$transaction(async (tx) => {
    const updated = await tx.sale.update({
      where: { id },
      data: { status: newStatus },
    });

    if (newStatus === 'COMPLETED') {
      // Update vehicle status to SOLD
      await tx.vehicle.update({
        where: { id: sale.vehicleId },
        data: { status: 'SOLD' },
      });

      // Create invoice
      const amount = sale.salePrice;
      const tax = amount.toNumber() * 0.12;
      const total = amount.toNumber() * 1.12;

      await tx.invoice.create({
        data: {
          saleId: sale.id,
          amount,
          tax,
          total,
          issuedDate: new Date(),
          paymentStatus: 'UNPAID',
        },
      });
    }

    if (newStatus === 'CANCELLED') {
      // Release the vehicle back to available
      await tx.vehicle.update({
        where: { id: sale.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updated;
  });

  return updatedSale;
}
