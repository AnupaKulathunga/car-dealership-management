import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { buildPaginationMeta } from '../../utils/pagination';
import type {
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
  AppointmentsQueryInput,
} from './appointments.validator';
import type { Prisma } from '@prisma/client';

export async function getAppointments(
  query: AppointmentsQueryInput,
  userId?: number,
  role?: string
) {
  const { page, limit, status, type, agentId, sortBy, order } = query;

  const where: Prisma.AppointmentWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (agentId) {
    where.agentId = agentId;
  }

  // SALES_AGENT can only see their own appointments
  if (role === 'SALES_AGENT' && userId) {
    where.agentId = userId;
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vehicle: { select: { make: true, brand: true, model: true } },
        agent: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  const meta = buildPaginationMeta(page, limit, total);

  return { appointments, meta };
}

export async function getAppointmentById(id: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      agent: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  return appointment;
}

export async function createAppointment(data: CreateAppointmentInput, agentId: number) {
  const dateTime = new Date(data.dateTime);

  // Validate future date
  if (dateTime <= new Date()) {
    throw new AppError('Appointment date must be in the future', 400);
  }

  // Check customer exists
  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Check vehicle exists if provided
  if (data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }
  }

  // Check for double-booking within 1 hour window
  const oneHourBefore = new Date(dateTime.getTime() - 60 * 60 * 1000);
  const oneHourAfter = new Date(dateTime.getTime() + 60 * 60 * 1000);

  // Check same agent + dateTime conflict
  const agentConflict = await prisma.appointment.findFirst({
    where: {
      agentId,
      status: 'SCHEDULED',
      dateTime: {
        gte: oneHourBefore,
        lte: oneHourAfter,
      },
    },
  });

  if (agentConflict) {
    throw new AppError('Agent already has an appointment within this time window', 409);
  }

  // Check same vehicle + dateTime conflict
  if (data.vehicleId) {
    const vehicleConflict = await prisma.appointment.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: 'SCHEDULED',
        dateTime: {
          gte: oneHourBefore,
          lte: oneHourAfter,
        },
      },
    });

    if (vehicleConflict) {
      throw new AppError('Vehicle already has an appointment within this time window', 409);
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId ?? null,
      agentId,
      type: data.type,
      dateTime,
      status: 'SCHEDULED',
      notes: data.notes,
    },
  });

  return appointment;
}

export async function updateAppointmentStatus(
  id: number,
  { status: newStatus }: UpdateAppointmentStatusInput
) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Only SCHEDULED appointments can be updated
  if (appointment.status !== 'SCHEDULED') {
    throw new AppError(
      `Cannot update appointment status from ${appointment.status}. Only SCHEDULED appointments can be updated`,
      400
    );
  }

  // Valid transitions from SCHEDULED
  const validTransitions = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

  if (!validTransitions.includes(newStatus)) {
    throw new AppError(
      `Cannot transition appointment status from ${appointment.status} to ${newStatus}`,
      400
    );
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { status: newStatus },
  });

  return updatedAppointment;
}
