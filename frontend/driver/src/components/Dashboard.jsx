import React, { useState } from 'react';

export default function Dashboard({ driver, vehicle, token, onLogout }) {
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
            <div className="dashboard-header">
                <div className="header-info">
                    <h1>{driver.name}</h1>
                    <span className="driver-id">ID: {driver.id}</span>
                </div>
                <button onClick={onLogout} className="logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>

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
                    <span className="label">Phone</span>
                    <span className="value">{driver.phone}</span>
                </div>
                {vehicle && (
                    <div className="info-item">
                        <span className="label">Plate Number</span>
                        <span className="value">{vehicle.plate_number || 'N/A'}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
