"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const item_service_1 = require("./item.service");
class ItemController {
    static async createItem(req, res, next) {
        try {
            const files = req.files;
            const item = await item_service_1.ItemService.createItem(req.user.id, req.body, files || []);
            res.status(201).json({ success: true, data: item, message: 'Item created successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getItems(req, res, next) {
        try {
            const result = await item_service_1.ItemService.getItems(req.query);
            res.status(200).json({ success: true, data: result, message: 'Items retrieved successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getItemById(req, res, next) {
        try {
            const item = await item_service_1.ItemService.getItemById(req.params.id);
            res.status(200).json({ success: true, data: item, message: 'Item retrieved successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateItem(req, res, next) {
        try {
            const item = await item_service_1.ItemService.updateItem(req.params.id, req.user.id, req.body);
            res.status(200).json({ success: true, data: item, message: 'Item updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteItem(req, res, next) {
        try {
            const result = await item_service_1.ItemService.deleteItem(req.params.id, req.user.id);
            res.status(200).json({ success: true, data: result, message: 'Item deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ItemController = ItemController;
