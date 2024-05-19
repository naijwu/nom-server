import express, { Request, Response } from 'express';
import { getVisit, setVisit } from '../helpers/firebase';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { visitId, statusCode } = req.body;

  const visitData = getVisit(visitId);
  await setVisit(visitId, {
    ...visitData,
    statusCode,
  });
});

export default router;
