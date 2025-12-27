// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in kilometers
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Calculate ETA based on distance and average speed
function calculateETA(distance, averageSpeed = 30) {
    // distance in km, speed in km/h
    // Returns ETA in minutes
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
}

// Find nearest vehicle to a given location
function findNearestVehicle(userLat, userLon, vehicles) {
    if (!vehicles || vehicles.length === 0) {
        return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    vehicles.forEach(vehicle => {
        if (vehicle.latitude && vehicle.longitude) {
            const distance = calculateDistance(
                userLat, userLon,
                vehicle.latitude, vehicle.longitude
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = {
                    ...vehicle,
                    distance: distance,
                    eta: calculateETA(distance, vehicle.speed || 30)
                };
            }
        }
    });

    return nearest;
}

module.exports = {
    calculateDistance,
    calculateETA,
    findNearestVehicle
};
