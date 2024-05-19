import express, { Request, Response } from 'express';
import { getSubscriptionObjects, getVisit, setVisit } from '../helpers/firebase';
import { sendGroupNotifications, sendGroupNotificationsSuccess } from '../helpers/notification';

const router = express.Router();

router.post('/:visitId', async (req: Request, res: Response) => {
  // const { visitId, statusCode } = req.body;
  const { visitId } = req.params;

  try {
    const visitData = await getVisit(visitId); // Await the asynchronous call

    if (!visitData) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    await setVisit(visitId, {
      ...visitData,
      statusCode: 3,
    });
    const userSubscriptions: any = await getSubscriptionObjects(visitData.groupId);

    // send push to all in the group
    await sendGroupNotificationsSuccess(userSubscriptions, visitId, {
      type: 'booked',
      title: 'Hello!',
      body: `Reservations have been made at ${visitData?.bookedRestaurant?.name || 'your restaurant'}`,
      visitId,
    });

    res.json({ message: 'Visit status updated.' });
  } catch (error) {
    console.error('Error updating visit status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
