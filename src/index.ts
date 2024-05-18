import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import googlePlacesRoutes from './routes/googlePlacesRoutes';
import geocodeRoute from './routes/geocodeRoute';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

app.use(bodyParser.json());
app.use('/api/google-places', googlePlacesRoutes);
app.use('/api/geocode', geocodeRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
