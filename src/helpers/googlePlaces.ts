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

export const searchNearbyPlaces = async (requestData: PlacesRequest) => {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'places.displayName',
  };

  const body = {
    ...requestData,
    languageCode: 'en',
    maxResultCount: 15,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error searching nearby places: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.places) {
      data.places = data.places.map((place: any) => ({
        ...place,
        displayName: place.displayName?.text,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error in searchNearbyPlaces:', error);
    throw new Error('Failed to search nearby places');
  }
};

export const textSearchPlaces = async (requestData: TextSearchRequest) => {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask':
      'places.displayName,places.formattedAddress,places.priceLevel,places.nationalPhoneNumber,places.rating,places.types',
  };

  const { center, radius, ...restRequestData } = requestData;
  const locationRestriction = calculateRectangle(center, radius);

  const body = {
    ...restRequestData,
    locationRestriction: { rectangle: locationRestriction },
    pageSize: 10,
    languageCode: 'en',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error searching text places: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.places) {
      data.places = data.places.map((place: any) => ({
        ...place,
        displayName: place.displayName?.text,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error in searchTextPlaces:', error);
    throw new Error('Failed to search text places');
  }
};
