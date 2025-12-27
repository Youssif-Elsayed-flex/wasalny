import React, { useState, useEffect } from 'react';

export default function RouteSelection({ driver, token, onRouteSelected }) {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/driver/routes');
            const data = await response.json();
            if (data.success) {
                setRoutes(data.routes);
            }
        } catch (err) {
            console.error('Failed to fetch routes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/driver/assign-route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driver_id: driver.id,
                    route_id: selectedRoute,
                    plate_number: plateNumber
                }),
            });

            const data = await response.json();

            if (data.success) {
                onRouteSelected();
            } else {
                setError(data.error || 'Failed to assign route');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container premium-card">
            <div className="brand-header">
                <h1>Wasalny</h1>
                <p className="subtitle">Select Your Route</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                    <label className="input-label">Select Route (Line)</label>
                    <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        required
                        className="premium-input"
                    >
                        <option value="">-- Choose a Route --</option>
                        {routes.map(route => (
                            <option key={route.id} value={route.id}>
                                {route.name} ({route.start_point} - {route.end_point})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="input-label">Vehicle Plate Number</label>
                    <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        required
                        placeholder="e.g. ABC 123"
                        className="premium-input"
                    />
                </div>

                <button type="submit" disabled={loading} className="premium-button">
                    {loading ? 'Saving...' : 'Start Driving'}
                </button>
            </form>
        </div>
    );
}
