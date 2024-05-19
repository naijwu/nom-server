import express, { Request, Response } from 'express';
import { webpush } from '..';
const router = express.Router();
import { getSubscriptionObjects, getUserData } from '../helpers/firebase';

router.get('/testgroup/:group_id', async (req: Request, res: Response) => {
  const { group_id } = req.params;
  try {
    // get user data using uid
    const userSubscriptions: any = await getSubscriptionObjects(group_id);

    // send push to all in the group
    for (let i = 0; i < userSubscriptions?.length; i++) {
      const subData = JSON.parse(userSubscriptions[i]);
      const payload = JSON.stringify({
        type: '',
        title: 'Hello!',
        body: 'You have a new notification.',
      });
      webpush
        .sendNotification(subData, payload)
        .then((res: any) => console.log('Notification sent:', res))
        .catch((err: any) => console.error('Error sending notification:', err));
    }

    return res.status(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send subscription' });
  }
});

router.get('/test/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    // get user data using uid
    const user = await getUserData(uid);
    if (!user) return res.status(400).json({ error: 'No user of uid provided' });
    const subData = JSON.parse(user.subscription);

    // send push
    const payload = JSON.stringify({ title: 'Hello!', body: 'You have a new notification.' });

    webpush
      .sendNotification(subData, payload)
      .then((res: any) => console.log('Notification sent:', res))
      .catch((err: any) => console.error('Error sending notification:', err));

    return res.status(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send subscription' });
  }
});

export default router;
