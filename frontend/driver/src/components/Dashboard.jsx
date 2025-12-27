import React, { useState } from 'react';

export default function Dashboard({ driver, token, onLogout }) {
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
                    'Authorization': `Bearer ${token}` // Assuming backend might need auth eventually, though current route doesn't strictly check header in the snippet provided
                },
                body: JSON.stringify({
                    driver_id: driver.id,
                    status: newStatus
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus(newStatus);
                setMessage(`Status updated to ${newStatus}`);
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
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {driver.name}</h1>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </header>

            <div className="status-card">
                <h3>Current Status</h3>
                <div className={`status-indicator ${status}`}>
                    {status.toUpperCase()}
                </div>
                <button
                    onClick={toggleStatus}
                    disabled={loading}
                    className={`status-toggle-btn ${status === 'active' ? 'btn-red' : 'btn-green'}`}
                >
                    {loading ? 'Updating...' : (status === 'active' ? 'Go Offline' : 'Go Online')}
                </button>
                {message && <p className="status-message">{message}</p>}
            </div>

            <div className="info-card">
                <h3>Driver Information</h3>
                <p><strong>Phone:</strong> {driver.phone}</p>
                <p><strong>ID:</strong> {driver.id}</p>
            </div>
        </div>
    );
}
