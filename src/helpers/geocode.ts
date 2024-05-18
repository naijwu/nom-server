import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

interface GeocodingRequest {
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results: Array<{
    formatted_address: string;
  }>;
}

export const getGeocodingData = async (
  requestData: GeocodingRequest
): Promise<GeocodingResponse> => {
  const { latitude, longitude } = requestData;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching geocoding data: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getGeocodingData:', error);
    throw new Error('Failed to fetch geocoding data');
  }
};

export const extractFormattedAddresses = (geocodingResponse: GeocodingResponse): string[] => {
  return geocodingResponse.results.map((result) => result.formatted_address);
};
