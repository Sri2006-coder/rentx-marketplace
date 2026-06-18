import { Request, Response, NextFunction } from 'express';
import { ItemService } from './item.service';

export class ItemController {
  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const item = await ItemService.createItem(req.user!.id, req.body, files || []);
      res.status(201).json({ success: true, data: item, message: 'Item created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItemService.getItems(req.query as any);
      res.status(200).json({ success: true, data: result, message: 'Items retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ItemService.getItemById(req.params.id as string);
      res.status(200).json({ success: true, data: item, message: 'Item retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ItemService.updateItem(req.params.id as string, req.user!.id, req.body);
      res.status(200).json({ success: true, data: item, message: 'Item updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItemService.deleteItem(req.params.id as string, req.user!.id);
      res.status(200).json({ success: true, data: result, message: 'Item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
