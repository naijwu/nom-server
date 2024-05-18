import { Router, Request, Response } from 'express';
import { searchNearbyPlaces } from '../helpers/googlePlacesHelpers';

const router = Router();

router.post('/search-nearby', async (req: Request, res: Response) => {
  const requestData = req.body;
  try {
    const data = await searchNearbyPlaces(requestData);
    res.json(data);
  } catch (error) {
    res.status(500).send('Failed to search nearby places');
  }
});

export default router;
