import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const payment = await PaymentService.createPaymentIntent(bookingId, req.user!.id);
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const mockSuccess = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    const payment = await PaymentService.mockPaymentSuccess(paymentId, req.user!.id);
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const mockFailure = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    const payment = await PaymentService.mockPaymentFailure(paymentId, req.user!.id);
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const history = await PaymentService.getPaymentHistory(req.user!.id);
    res.json({ success: true, payments: history });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
