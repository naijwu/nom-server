import express, { Router, Request, Response } from 'express';
import { searchNearbyPlaces } from '../helpers/googlePlaces';

const router = Router();

router.use(express.json());

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
