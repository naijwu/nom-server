import webpush from 'web-push';

export const sendGroupNotifications = async (userSubscriptions: any[], visitId: any) => {
  try {
    for (let i = 0; i < userSubscriptions?.length; i++) {
      const subData = JSON.parse(userSubscriptions[i]);
      const payload = JSON.stringify({
        type: '',
        title: 'Hello!',
        body: `Vote for visit ${visitId}`,
      });

      await webpush
        .sendNotification(subData, payload)
        .then((res: any) => console.log('Notification sent:', res))
        .catch((err: any) => console.error('Error sending notification:', err));
    }
  } catch (error) {
    console.error('Failed to send notifications:', error);
    throw new Error('Failed to send notifications');
  }
};
