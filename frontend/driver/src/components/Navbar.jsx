import React from 'react';

export default function Navbar({ driver, onLogout, onChangeRoute }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>Wasalny</h1>
            </div>

            <div className="navbar-actions">
                <span className="driver-name">{driver.name}</span>

                <button onClick={onChangeRoute} className="nav-btn route-btn">
                    Change Route
                </button>

                <button onClick={onLogout} className="nav-btn logout-btn-nav">
                    Logout
                </button>
            </div>
        </nav>
    );
}
