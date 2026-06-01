/**
 * Haversine formula — calculates great-circle distance between
 * two latitude/longitude coordinate pairs in meters.
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Convert degrees to radians
 */
const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Calculate the distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters (rounded to nearest meter)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance);
};

/**
 * Check if a student's location is within the allowed radius of the classroom
 * @param {number} studentLat - Student's latitude
 * @param {number} studentLon - Student's longitude
 * @param {number} classLat - Classroom latitude
 * @param {number} classLon - Classroom longitude
 * @param {number} radiusMeters - Allowed radius in meters
 * @returns {boolean} True if within radius
 */
const isWithinRadius = (studentLat, studentLon, classLat, classLon, radiusMeters) => {
  const distance = calculateDistance(studentLat, studentLon, classLat, classLon);
  return distance <= radiusMeters;
};

module.exports = { calculateDistance, isWithinRadius };
