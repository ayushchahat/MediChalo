/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {Array<number>} coords1 [longitude, latitude]
 * @param {Array<number>} coords2 [longitude, latitude]
 * @returns {number} The distance in kilometers
 */
function getDistanceFromLatLonInKm(coords1, coords2) {
    if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) return 0;

    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculates the ETA in minutes.
 * @param {Array<number>} startCoords [longitude, latitude] of the pharmacy
 * @param {Array<number>} endCoords [longitude, latitude] of the customer
 * @returns {string} The formatted ETA string (e.g., "25-30 min")
 */
export function calculateETAMinutes(startCoords, endCoords) {
    const PREPARATION_TIME_MINUTES = 10;
    const AVERAGE_SPEED_KMPH = 60;

    const distanceKm = getDistanceFromLatLonInKm(startCoords, endCoords);
    if (distanceKm === 0) return "N/A";

    const travelTimeHours = distanceKm / AVERAGE_SPEED_KMPH;
    const travelTimeMinutes = Math.round(travelTimeHours * 60);

    const totalTime = travelTimeMinutes + PREPARATION_TIME_MINUTES;

    // Provide a 5-minute range for the ETA
    const lowerBound = Math.max(10, totalTime - 2); // At least 10 minutes
    const upperBound = totalTime + 3;

    return `${lowerBound}-${upperBound} min`;
}
