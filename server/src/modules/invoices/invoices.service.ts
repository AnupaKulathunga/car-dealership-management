import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

export async function getInvoiceById(id: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      sale: {
        include: {
          vehicle: true,
          customer: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  return invoice;
}

export async function getInvoiceBySaleId(saleId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { saleId },
    include: {
      sale: {
        include: {
          vehicle: true,
          customer: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  return invoice;
}
