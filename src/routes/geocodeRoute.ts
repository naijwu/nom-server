import express, { Request, Response } from 'express';
import { getGeocodingData, extractFormattedAddresses, getCoordinates } from '../helpers/geocode';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    const geocodingResponse = await getGeocodingData(requestData);
    const addresses = extractFormattedAddresses(geocodingResponse);
    const firstAddress = addresses.length > 0 ? addresses[0] : null;

    if (!firstAddress) {
      return res.status(404).json({ error: 'No valid addresses found' });
    }

    res.json({ address: firstAddress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

router.post('/coordinates', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    const coordinates = await getCoordinates(address);

    res.json(coordinates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

export default router;
