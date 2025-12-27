import React, { useState } from 'react';

export default function Login({ onLogin, onSwitchToRegister }) {
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/driver/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                onLogin(data.token, data.driver, data.vehicle);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container premium-card">
            <div className="brand-header">
                <h1>Wasalny</h1>
                <p className="subtitle">Driver Login</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                    <label className="input-label">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="Enter your phone number"
                        className="premium-input"
                    />
                </div>
                <div className="form-group">
                    <label className="input-label">Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Enter your password"
                        className="premium-input"
                    />
                </div>

                <button type="submit" disabled={loading} className="premium-button">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="auth-footer">
                <p>New to Wasalny?</p>
                <button onClick={onSwitchToRegister} className="link-button">Create Account</button>
            </div>
        </div>
    );
}
