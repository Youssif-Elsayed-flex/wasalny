import React, { useState } from 'react';

export default function Dashboard({ driver, vehicle, token }) {
    const [status, setStatus] = useState(driver.status);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const toggleStatus = async () => {
        setLoading(true);
        const newStatus = status === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch('http://localhost:3000/api/driver/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driver_id: driver.id,
                    status: newStatus
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus(newStatus);
                setMessage(newStatus === 'active' ? 'You are now ONLINE' : 'You are now OFFLINE');
            } else {
                setMessage('Failed to update status');
            }
        } catch (err) {
            setMessage('Connection error');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="dashboard-container premium-card">
            <div className="status-section">
                <div className={`status-display ${status}`}>
                    {status === 'active' ? 'ONLINE' : 'OFFLINE'}
                </div>

                {message && <div className="status-toast">{message}</div>}

                <button
                    onClick={toggleStatus}
                    disabled={loading}
                    className={`status-toggle-btn ${status === 'active' ? 'btn-stop' : 'btn-start'}`}
                >
                    {loading ? 'Updating...' : (status === 'active' ? 'STOP DRIVING' : 'START DRIVING')}
                </button>
            </div>

            <div className="info-grid">
                <div className="info-item">
                    <span className="label">Driver ID</span>
                    <span className="value">{driver.id}</span>
                </div>
                <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">{driver.phone}</span>
                </div>
                {vehicle && (
                    <div className="info-item">
                        <span className="label">Plate</span>
                        <span className="value">{vehicle.plate_number || 'N/A'}</span>
                    </div>
                )}
                {vehicle && vehicle.route_name && (
                    <div className="info-item">
                        <span className="label">Route</span>
                        <span className="value">{vehicle.route_name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
