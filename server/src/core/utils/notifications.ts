export const sendMockNotification = (userId: string, title: string, message: string) => {
  console.log('\n=========================================');
  console.log('🔔 MOCK NOTIFICATION TRIGGERED');
  console.log(`To User ID: ${userId}`);
  console.log(`Title:      ${title}`);
  console.log(`Message:    ${message}`);
  console.log('=========================================\n');
};
