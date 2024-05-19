import dotenv from 'dotenv';
import { calculateRectangle } from './locationRestriction';

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export interface Location {
  latitude: number;
  longitude: number;
}

interface Circle {
  center: Location;
  radius: number;
}

interface PlacesRequest {
  includedTypes: string[];
  locationRestriction: Circle;
}

interface TextSearchRequest {
  textQuery: string;
  center: Location;
  radius: number;
}

const createHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': API_KEY,
  'X-Goog-FieldMask':
    'places.displayName,places.formattedAddress,places.priceLevel,places.nationalPhoneNumber,places.rating,places.id,places.photos,places.editorialSummary',
});

export const priceLevels: { [key: string]: number } = {
  PRICE_LEVEL_UNSPECIFIED: -1,
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const processPlacesResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (data.places) {
    data.places = await Promise.all(
      data.places.map(async (place: any) => {
        const { photos, ...restPlace } = place;
        const photoNames = photos?.slice(0, 4).map((photo: any) => photo.name) || [];
        const photoUris = await Promise.all(
          photoNames.map((name: string) => fetchPlaceMedia(name))
        );

        return {
          ...restPlace,
          priceLevel: priceLevels[place?.priceLevel] || -1,
          displayName: place.displayName?.text,
          editorialSummary: place.editorialSummary?.text,
          photos: photoUris.filter((uri) => uri !== null).slice(0, 3),
        };
      })
    );
    data.places = data.places.filter((place: any) => place.priceLevel !== -1);
  }

  return data;
};

const makePlacesRequest = async (url: string, body: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(body),
    });

    return await processPlacesResponse(response);
  } catch (error) {
    console.error('Error in makePlacesRequest:', error);
    throw new Error('Failed to make places request');
  }
};

export const searchNearbyPlaces = async (requestData: PlacesRequest) => {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const body = {
    ...requestData,
    languageCode: 'en',
    maxResultCount: 15,
  };

  return makePlacesRequest(url, body);
};

export const textSearchPlaces = async (requestData: TextSearchRequest) => {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const { center, radius, ...restRequestData } = requestData;
  const locationRestriction = calculateRectangle(center, radius);

  const body = {
    ...restRequestData,
    locationRestriction: { rectangle: locationRestriction },
    pageSize: 10,
    languageCode: 'en',
  };

  return makePlacesRequest(url, body);
};

export const fetchPlaceMedia = async (name: string) => {
  const url = `https://places.googleapis.com/v1/${name}/media?key=${API_KEY}&maxHeightPx=1000&skipHttpRedirect=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching media: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.photoUri;
  } catch (error) {
    console.error('Error in fetchPlaceMedia:', error);
    throw new Error('Failed to fetch place media');
  }
};
