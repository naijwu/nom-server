import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import googlePlacesRoutes from './routes/googlePlacesRoutes';
import geocodeRoute from './routes/geocodeRoute';
import subRoute from './routes/subRoute';
import recommendationsRoute from './routes/recommendationsRoute';

export const webpush = require('web-push');
const vapidKeys = {
  publicKey:
    'BKbaoN9g8qz6RLHlc8Tc4dWAUIwtzy1MZMyFy50ieb3R14JQJC4m7415bWapGQ5CEHWAndHxGwP174C6xAlalwU',
  privateKey: 'BKqoaBAJdwk1WdQNOm-WWJXDRi8W7STqPYJEBAxhhKg',
};
webpush.setVapidDetails('mailto:jaewuchun@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

app.use(bodyParser.json());
app.use('/api/google-places', googlePlacesRoutes);
app.use('/api/geocode', geocodeRoute);
app.use('/api/subscription', subRoute);
app.use('/api/recommendations', recommendationsRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
