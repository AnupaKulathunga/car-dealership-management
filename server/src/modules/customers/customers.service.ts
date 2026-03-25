import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { buildPaginationMeta } from '../../utils/pagination';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerQueryInput } from './customers.validator';
import type { Prisma } from '@prisma/client';

export async function getCustomers(query: CustomerQueryInput) {
  const { page, limit, search } = query;

  const where: Prisma.CustomerWhereInput = {};

  // Search filter: firstName OR lastName OR email OR phone contains search term
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  const meta = buildPaginationMeta(page, limit, total);

  return { customers, meta };
}

export async function getCustomerById(id: number) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: { include: { vehicle: true } },
      appointments: { include: { vehicle: true } },
    },
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  return customer;
}

export async function createCustomer(data: CreateCustomerInput) {
  // Check email uniqueness if provided
  if (data.email) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new AppError('A customer with this email already exists', 409);
    }
  }

  const customer = await prisma.customer.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
    },
  });

  return customer;
}

export async function updateCustomer(id: number, data: UpdateCustomerInput) {
  // Check customer exists
  const existingCustomer = await prisma.customer.findUnique({ where: { id } });

  if (!existingCustomer) {
    throw new AppError('Customer not found', 404);
  }

  // If email is being changed, check uniqueness
  if (data.email && data.email !== existingCustomer.email) {
    const emailExists = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new AppError('A customer with this email already exists', 409);
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data,
  });

  return customer;
}

export async function deleteCustomer(id: number) {
  // Check customer exists
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { sales: true },
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Check no active sales (PENDING or NEGOTIATION are considered active)
  const activeSales = customer.sales.filter(
    (sale) => sale.status === 'PENDING' || sale.status === 'NEGOTIATION'
  );

  if (activeSales.length > 0) {
    throw new AppError('Cannot delete a customer with active sales', 400);
  }

  await prisma.customer.delete({ where: { id } });

  return { message: 'Customer deleted successfully' };
}
