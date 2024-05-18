import { Location } from './googlePlaces';
const R = 6371e3;

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);

const calculateLatitudeDegrees = (radius: number) => (radius / R) * (180 / Math.PI);

const calculateLongitudeDegrees = (radius: number, latitude: number) => {
  const radiusInRadians = radius / R;
  const latitudeInRadians = degreesToRadians(latitude);
  return radiansToDegrees(radiusInRadians / Math.cos(latitudeInRadians));
};

export const calculateRectangle = (center: Location, radius: number) => {
  const latDiff = calculateLatitudeDegrees(radius);
  const lonDiff = calculateLongitudeDegrees(radius, center.latitude);

  const low = {
    latitude: center.latitude - latDiff,
    longitude: center.longitude - lonDiff,
  };

  const high = {
    latitude: center.latitude + latDiff,
    longitude: center.longitude + lonDiff,
  };

  return { low, high };
};