import express, { Request, Response } from 'express';
import { getVisit, setVisit } from '../helpers/firebase';

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
      statusCode: 2,
    });

    res.json({ message: 'Visit status updated.' });
  } catch (error) {
    console.error('Error updating visit status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
