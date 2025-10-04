// This helper calculates a simple Estimated Time of Arrival (ETA)

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of the first point
 * @param {number} lon1 Longitude of the first point
 * @param {number} lat2 Latitude of the second point
 * @param {number} lon2 Longitude of the second point
 * @returns {number} The distance in kilometers
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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
 * Calculates the ETA based on distance and average speed.
 * @param {Array<number>} startCoords [longitude, latitude]
 * @param {Array<number>} endCoords [longitude, latitude]
 * @returns {Date} The calculated ETA as a Date object
 */
function calculateETA(startCoords, endCoords) {
    const PREPARATION_TIME_MINUTES = 15; // Time for pickup and preparation
    const AVERAGE_SPEED_KMPH = 20; // Average speed of a delivery vehicle in the city

    const distanceKm = getDistanceFromLatLonInKm(
        startCoords[1], // lat1
        startCoords[0], // lon1
        endCoords[1],   // lat2
        endCoords[0]    // lon2
    );

    const travelTimeHours = distanceKm / AVERAGE_SPEED_KMPH;
    const travelTimeMinutes = travelTimeHours * 60;

    const totalTimeMinutes = travelTimeMinutes + PREPARATION_TIME_MINUTES;

    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + totalTimeMinutes);

    return eta;
}

module.exports = { calculateETA };
