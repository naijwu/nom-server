import express, { Router, Request, Response } from 'express';
import { textSearchPlaces, fetchPlaceMedia } from '../helpers/googlePlaces';
import { getUserPreferences, getFoodRecommendations } from '../helpers/firebase';

const router = Router();

router.use(express.json());

router.get('/', async (req: Request, res: Response) => {
  const { users, center, radius } = req.body;

  const foodPreferences = await getUserPreferences(users).then((foods) => {
    const recommendations = getFoodRecommendations(users, foods);
    return recommendations;
  });

  console.log(foodPreferences);

  if (!Array.isArray(foodPreferences) || foodPreferences.length === 0) {
    return res.status(400).send('Food preferences array is required.');
  }

  if (!center || !('latitude' in center) || !('longitude' in center)) {
    return res
      .status(400)
      .send('Center location is required and should include latitude and longitude.');
  }

  if (!radius) {
    return res.status(400).send('Radius is required.');
  }

  try {
    const searchPromises = foodPreferences.map((cuisine) => {
      const requestData = {
        textQuery: `${cuisine} restaurant`,
        center: { latitude: center.latitude, longitude: center.longitude },
        radius: radius,
      };
      return textSearchPlaces(requestData);
    });

    const responses = await Promise.all(searchPromises);

    const results: any[] = [];
    let hasMoreResults = true;
    let index = 0;

    const getRandomPlace = (places: any[]) => {
      return places[Math.floor(Math.random() * places.length)];
    };

    while (results.length < 3 && hasMoreResults) {
      hasMoreResults = false;
      for (const response of responses) {
        if (response.places && response.places.length > index) {
          results.push(getRandomPlace(response.places));
          hasMoreResults = true;
        }
        if (results.length >= 3) break;
      }
      index++;
    }

    if (results.length < 3) {
      const fallbackRequestData = {
        textQuery: 'restaurant',
        center: { latitude: center.latitude, longitude: center.longitude },
        radius: radius,
      };
      const fallbackResponse = await textSearchPlaces(fallbackRequestData);
      if (fallbackResponse.places) {
        for (const place of fallbackResponse.places) {
          if (results.length < 3) {
            results.push(place);
          }
        }
      }
    }

    for (const place of results) {
      if (place.photo) {
        place.photo = await fetchPlaceMedia(place.photo);
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).send('Failed to get recommendations');
  }
});

export default router;
