import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { formatSuccess } from '../../utils/response';
import * as invoicesService from './invoices.service';

const router = Router();

// GET /:id — Get invoice by ID
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      const invoice = await invoicesService.getInvoiceById(id);
      res.json(formatSuccess(invoice));
    } catch (error) {
      next(error);
    }
  }
);

// GET /sale/:saleId — Get invoice by sale ID
router.get(
  '/sale/:saleId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saleId = parseInt(req.params['saleId'] as string, 10);
      const invoice = await invoicesService.getInvoiceBySaleId(saleId);
      res.json(formatSuccess(invoice));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
