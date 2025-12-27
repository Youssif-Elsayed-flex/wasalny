const { useState, useEffect, useRef } = React;

const API_BASE = '/api';
const WS_URL = window.location.origin;

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate ETA
function calculateETA(distance, speed = 30) {
    const timeInHours = distance / speed;
    const minutes = Math.round(timeInHours * 60);
    return minutes;
}

// Vehicle Card Component
function VehicleCard({ vehicle, userLocation, isNearest }) {
    const distance = userLocation
        ? calculateDistance(userLocation.latitude, userLocation.longitude, vehicle.latitude, vehicle.longitude)
        : null;

    const eta = distance ? calculateETA(distance, vehicle.speed || 30) : null;

    return (
        <div className={`vehicle-card ${isNearest ? 'nearest' : ''}`}>
            <div className="vehicle-header">
                <div className="plate-number">🚌 {vehicle.plate_number}</div>
                <div className="status-badge">نشط</div>
            </div>
            <div className="vehicle-info">
                <div className="info-item">
                    <span className="info-label">خط السير</span>
                    <span className="info-value">{vehicle.route_name || 'غير محدد'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">السائق</span>
                    <span className="info-value">{vehicle.driver_name || 'غير محدد'}</span>
                </div>
                {vehicle.speed !== undefined && (
                    <div className="info-item">
                        <span className="info-label">السرعة</span>
                        <span className="info-value">{Math.round(vehicle.speed)} كم/ساعة</span>
                    </div>
                )}
                {distance && (
                    <div className="info-item">
                        <span className="info-label">المسافة</span>
                        <span className="info-value">{distance.toFixed(2)} كم</span>
                    </div>
                )}
                {eta && (
                    <div className="info-item">
                        <span className="info-label">الوقت التقريبي</span>
                        <span className="info-value">{eta} دقيقة</span>
                    </div>
                )}
            </div>
            {isNearest && (
                <div className="nearest-badge">
                    ⭐ أقرب عربية لموقعك
                </div>
            )}
        </div>
    );
}

// Main Passenger App
function PassengerApp() {
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [nearestVehicle, setNearestVehicle] = useState(null);
    const [socket, setSocket] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        // Get user location
        getUserLocation();

        // Fetch initial data
        fetchRoutes();
        fetchVehicles();

        // Connect to WebSocket
        const ws = io(WS_URL);
        setSocket(ws);

        // Listen for real-time updates
        ws.on('vehicle:update', (data) => {
            console.log('Vehicle update received:', data);
            updateVehicleLocation(data);
        });

        ws.on('vehicles:list', (data) => {
            console.log('Vehicles list received:', data);
            setVehicles(data.vehicles);
            setLastUpdate(new Date());
        });

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            fetchVehicles();
        }, 10000);

        // Initialize Map
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([30.0444, 31.2357], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        return () => {
            if (ws) ws.disconnect();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            clearInterval(interval);
        };
    }, []);

    const mapRef = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Add vehicle markers
        vehicles.forEach(vehicle => {
            if (vehicle.latitude && vehicle.longitude) {
                const marker = L.marker([vehicle.latitude, vehicle.longitude], {
                    icon: L.divIcon({
                        className: 'bus-marker',
                        html: `<div style="font-size: 24px;">🚌</div>`,
                        iconSize: [30, 30]
                    })
                })
                    .addTo(mapRef.current)
                    .bindPopup(`<strong>${vehicle.plate_number}</strong><br>${vehicle.route_name || ''}`);

                markersRef.current[vehicle.vehicle_id] = marker;
            }
        });

        // Fit bounds if vehicles exist
        if (vehicles.length > 0) {
            const points = vehicles
                .filter(v => v.latitude && v.longitude)
                .map(v => [v.latitude, v.longitude]);
            if (points.length > 0) {
                mapRef.current.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [vehicles]);

    useEffect(() => {
        // Calculate nearest vehicle when vehicles or user location changes
        if (userLocation && vehicles.length > 0) {
            let nearest = null;
            let minDistance = Infinity;

            vehicles.forEach(vehicle => {
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    vehicle.latitude,
                    vehicle.longitude
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = vehicle.vehicle_id;
                }
            });

            setNearestVehicle(nearest);
        }
    }, [vehicles, userLocation]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${API_BASE}/routes`);
            const data = await response.json();
            if (data.success) {
                setRoutes(data.routes);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const fetchVehicles = async (routeId = selectedRoute) => {
        try {
            const url = routeId
                ? `${API_BASE}/routes/${routeId}/vehicles`
                : `${API_BASE}/vehicles/live`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setVehicles(data.vehicles);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const updateVehicleLocation = (updatedVehicle) => {
        setVehicles(prevVehicles => {
            const index = prevVehicles.findIndex(v => v.vehicle_id === updatedVehicle.vehicle_id);
            if (index >= 0) {
                const newVehicles = [...prevVehicles];
                newVehicles[index] = {
                    ...newVehicles[index],
                    latitude: updatedVehicle.latitude,
                    longitude: updatedVehicle.longitude,
                    speed: updatedVehicle.speed
                };
                return newVehicles;
            } else {
                return [...prevVehicles, updatedVehicle];
            }
        });
        setLastUpdate(new Date());
    };

    const handleRouteChange = (e) => {
        const routeId = e.target.value;
        setSelectedRoute(routeId);
        fetchVehicles(routeId);
    };

    const handleRefresh = () => {
        fetchVehicles();
        getUserLocation();
    };

    return (
        <div className="passenger-container">
            <div className="header">
                <div className="app-title">
                    <span>🚍</span>
                    <span>{window.t('app_name')}</span>
                </div>
                <div className="subtitle">{window.t('passenger_app')}</div>
            </div>

            <div className="map-wrapper">
                <div id="map" className="map-container" style={{ height: '100%', width: '100%' }}></div>

                <div className="filters-panel">
                    <select
                        className="filter-select"
                        value={selectedRoute}
                        onChange={handleRouteChange}
                    >
                        <option value="">{window.t('select_route')}</option>
                        {routes.map(route => (
                            <option key={route.id} value={route.id}>
                                {route.name}
                            </option>
                        ))}
                    </select>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        🔄 تحديث
                    </button>
                </div>
            </div>

            <div className="bottom-panel">
                <div className="panel-title">
                    <span>العربيات المتاحة ({vehicles.length})</span>
                    {lastUpdate && (
                        <div className="live-indicator">
                            <span className="pulse-dot"></span>
                            <span>آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}</span>
                        </div>
                    )}
                </div>

                {vehicles.length > 0 ? (
                    <div className="vehicles-grid">
                        {vehicles.map(vehicle => (
                            <VehicleCard
                                key={vehicle.vehicle_id}
                                vehicle={vehicle}
                                userLocation={userLocation}
                                isNearest={vehicle.vehicle_id === nearestVehicle}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🚫</div>
                        <div>لا توجد عربيات نشطة حاليًا</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Render App
ReactDOM.render(<PassengerApp />, document.getElementById('root'));
