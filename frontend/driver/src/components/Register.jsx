import React, { useState } from 'react';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/driver/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Auto login after register would be better, but for now just callback
                onRegisterSuccess();
            } else {
                setError(data.error || 'Registration failed');
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
                <p className="subtitle">Driver Registration</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                    <label className="input-label">Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                        className="premium-input"
                    />
                </div>
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
                        placeholder="Create a password"
                        className="premium-input"
                    />
                </div>
                <div className="form-group">
                    <label className="input-label">Confirm Password</label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        placeholder="Confirm your password"
                        className="premium-input"
                    />
                </div>

                <button type="submit" disabled={loading} className="premium-button">
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="auth-footer">
                <p>Already have an account?</p>
                <button onClick={onSwitchToLogin} className="link-button">Login here</button>
            </div>
        </div>
    );
}
