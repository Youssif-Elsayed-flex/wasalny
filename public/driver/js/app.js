const { useState, useEffect, useRef } = React;

const API_BASE = '/api';
const WS_URL = window.location.origin;

// Login Component
function LoginPage({ onLogin }) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/driver/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('driver_token', data.token);
                localStorage.setItem('driver', JSON.stringify(data.driver));
                localStorage.setItem('vehicle', JSON.stringify(data.vehicle));
                onLogin(data.driver, data.vehicle);
            } else {
                setError(data.error || 'فشل تسجيل الدخول');
            }
        } catch (error) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">🚍</div>
                <h1 className="login-title">{window.t('app_name')}</h1>
                <p className="login-subtitle">{window.t('driver_app')}</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{window.t('phone')}</label>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="01234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{window.t('password')}</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '...' : window.t('login')}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'white' }}>
                        {window.t('are_you_driver')} <a href="/driver-register.html" style={{ color: 'white', fontWeight: 'bold' }}>{window.t('register_now')}</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// GPS Tracker Component
function GPSTracker({ driver, vehicle, socket }) {
    const [location, setLocation] = useState(null);
    const [speed, setSpeed] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const watchId = useRef(null);

    useEffect(() => {
        if (driver.status === 'active' && vehicle) {
            startTracking();
        } else {
            stopTracking();
        }

        return () => stopTracking();
    }, [driver.status, vehicle]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            alert('المتصفح لا يدعم تحديد الموقع');
            return;
        }

        setIsTracking(true);

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const loc = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0 // Convert m/s to km/h
                };

                setLocation(loc);
                setSpeed(loc.speed);
                setLastUpdate(new Date());

                // Send to server
                sendLocationUpdate(loc);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('فشل الحصول على الموقع. تأكد من تفعيل GPS');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
    };

    const sendLocationUpdate = async (loc) => {
        if (!vehicle) return;

        try {
            // Send via HTTP
            await fetch(`${API_BASE}/driver/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driver_id: driver.id,
                    vehicle_id: vehicle.id,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    speed: loc.speed,
                    status: driver.status
                })
            });

            // Send via WebSocket if connected
            if (socket && socket.connected) {
                socket.emit('driver:location', {
                    vehicle_id: vehicle.id,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    speed: loc.speed
                });
            }
        } catch (error) {
            console.error('Error sending location:', error);
        }
    };

    return (
        <div className="info-card">
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>📍 {window.t('location_tracking')}</h3>
            {isTracking && (
                <div className="tracking-indicator">
                    <span>{window.t('sending_realtime')}</span>
                    <span className="tracking-pulse"></span>
                </div>
            )}
            <div className="info-row">
                <span className="info-label">{window.t('tracking_status')}</span>
                <span className="info-value">{isTracking ? window.t('active_status') : window.t('inactive_status')}</span>
            </div>
            {location && (
                <>
                    <div className="info-row">
                        <span className="info-label">{window.t('latitude')}</span>
                        <span className="info-value">{location.latitude.toFixed(6)}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">{window.t('longitude')}</span>
                        <span className="info-value">{location.longitude.toFixed(6)}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">{window.t('speed')}</span>
                        <span className="info-value">{speed} {window.t('km_per_hour')}</span>
                    </div>
                </>
            )}
            {lastUpdate && (
                <div className="info-row">
                    <span className="info-label">{window.t('last_update')}</span>
                    <span className="info-value">{lastUpdate.toLocaleTimeString('ar-EG')}</span>
                </div>
            )}
        </div>
    );
}

// Driver Dashboard
function DriverDashboard({ driver, vehicle, onLogout }) {
    const [status, setStatus] = useState(driver.status);
    const [socket, setSocket] = useState(null);
    const [isTracking, setIsTracking] = useState(driver.status === 'active'); // New state for tracking status

    useEffect(() => {
        // Connect to WebSocket
        const ws = io(WS_URL);
        setSocket(ws);

        return () => {
            if (ws) ws.disconnect();
        };
    }, []);

    useEffect(() => {
        setIsTracking(status === 'active');
    }, [status]);

    const toggleTracking = async () => {
        const newStatus = status === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch(`${API_BASE}/driver/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driver_id: driver.id,
                    status: newStatus
                })
            });

            const data = await response.json();
            if (data.success) {
                setStatus(newStatus);

                // Update localStorage
                const updatedDriver = { ...driver, status: newStatus };
                localStorage.setItem('driver', JSON.stringify(updatedDriver));

                // Notify via WebSocket
                if (socket && socket.connected) {
                    socket.emit('driver:status', {
                        driver_id: driver.id,
                        vehicle_id: vehicle?.id,
                        status: newStatus
                    });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(window.t('failed_to_update_status'));
        }
    };

    return (
        <div className="driver-container">
            <div className="header">
                <div className="driver-profile">
                    <div className="avatar">D</div>
                    <div className="profile-info">
                        <h3>{window.t('welcome_driver')}</h3>
                        <p>{driver?.name}</p>
                    </div>
                </div>
                <button className="logout-btn" onClick={onLogout}>{window.t('logout')}</button>
            </div>

            <div className="status-banner">
                <div className="status-info">
                    <span className={`status-dot ${isTracking ? 'active' : ''}`}></span>
                    <span>{isTracking ? window.t('online') : window.t('offline')}</span>
                </div>
                <button
                    className={`toggle-btn ${isTracking ? 'stop' : 'start'}`}
                    onClick={toggleTracking}
                >
                    {isTracking ? window.t('stop_trip') : window.t('start_trip')}
                </button>
            </div>

            {vehicle && (
                <GPSTracker
                    driver={{ ...driver, status }}
                    vehicle={vehicle}
                    socket={socket}
                />
            )}

            {!vehicle && (
                <div className="info-card" style={{ textAlign: 'center', color: '#f59e0b' }}>
                    ⚠️ لم يتم تعيين عربية لك بعد. تواصل مع الإدارة.
                </div>
            )}

            <button className="btn btn-danger logout-btn" onClick={onLogout}>
                تسجيل الخروج
            </button>
        </div>
    );
}

// Main Driver App
function DriverApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [driver, setDriver] = useState(null);
    const [vehicle, setVehicle] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('driver_token');
        const driverData = localStorage.getItem('driver');
        const vehicleData = localStorage.getItem('vehicle');

        if (token && driverData) {
            setIsLoggedIn(true);
            setDriver(JSON.parse(driverData));
            setVehicle(vehicleData && vehicleData !== 'null' ? JSON.parse(vehicleData) : null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('driver_token');
        localStorage.removeItem('driver');
        localStorage.removeItem('vehicle');
        setIsLoggedIn(false);
        setDriver(null);
        setVehicle(null);
    };

    if (!isLoggedIn) {
        return <LoginPage onLogin={(driverData, vehicleData) => {
            setIsLoggedIn(true);
            setDriver(driverData);
            setVehicle(vehicleData);
        }} />;
    }

    return <DriverDashboard driver={driver} vehicle={vehicle} onLogout={handleLogout} />;
}

// Render App
ReactDOM.render(<DriverApp />, document.getElementById('root'));
