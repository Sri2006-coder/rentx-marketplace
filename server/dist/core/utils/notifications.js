"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMockNotification = void 0;
const sendMockNotification = (userId, title, message) => {
    console.log('\n=========================================');
    console.log('🔔 MOCK NOTIFICATION TRIGGERED');
    console.log(`To User ID: ${userId}`);
    console.log(`Title:      ${title}`);
    console.log(`Message:    ${message}`);
    console.log('=========================================\n');
};
exports.sendMockNotification = sendMockNotification;
