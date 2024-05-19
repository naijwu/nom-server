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

const processPlacesResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (data.places) {
    data.places = data.places.map((place: any) => {
      const { photos, ...restPlace } = place;
      const photo = photos && photos.length > 0 ? `${photos[0].name}` : null;

      return {
        ...restPlace,
        displayName: place.displayName?.text,
        editorialSummary: place.editorialSummary?.text,
        photo,
      };
    });
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
