import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

interface Location {
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

export const searchNearbyPlaces = async (requestData: PlacesRequest) => {
  const url = BASE_URL;

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'places.displayName',
  };

  const body = {
    ...requestData,
    languageCode: 'en',
    maxResultCount: 15, // Fixed at 15
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
    return data;
  } catch (error) {
    console.error('Error in searchNearbyPlaces:', error);
    throw new Error('Failed to search nearby places');
  }
};
