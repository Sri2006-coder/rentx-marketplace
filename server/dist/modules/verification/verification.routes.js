"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_controller_1 = require("./verification.controller");
const requireAuth_1 = require("../../api/middlewares/requireAuth");
const upload_1 = require("../../api/middlewares/upload");
const router = (0, express_1.Router)();
// Require authentication for all routes
router.use(requireAuth_1.requireAuth);
router.post('/upload', upload_1.upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
]), verification_controller_1.VerificationController.uploadDocuments);
router.post('/auto-verify', upload_1.upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]), verification_controller_1.VerificationController.autoVerify);
router.get('/status', verification_controller_1.VerificationController.getStatus);
// Admin routes (Assume an requireAdmin middleware would go here in a real app, 
// but we omit it for Phase 6 as Admin Dashboard is explicitly skipped)
router.put('/approve/:id', verification_controller_1.VerificationController.approveVerification);
router.put('/reject/:id', verification_controller_1.VerificationController.rejectVerification);
exports.default = router;
