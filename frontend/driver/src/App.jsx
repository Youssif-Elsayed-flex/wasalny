import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import RouteSelection from './components/RouteSelection'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('driverToken'));
  const [driver, setDriver] = useState(JSON.parse(localStorage.getItem('driverInfo') || 'null'));
  const [vehicle, setVehicle] = useState(JSON.parse(localStorage.getItem('vehicleInfo') || 'null'));

  // Views: login, register, route-selection, dashboard
  const [view, setView] = useState('login');

  useEffect(() => {
    if (token && driver) {
      if (vehicle && view !== 'route-selection') { // Don't redirect to dashboard if explicitly selecting route
        setView('dashboard');
      } else if (!vehicle) {
        setView('route-selection');
      }
    } else {
      setView('login');
    }
  }, [token, driver, vehicle]);

  const handleLogin = (newToken, driverInfo, vehicleInfo) => {
    localStorage.setItem('driverToken', newToken);
    localStorage.setItem('driverInfo', JSON.stringify(driverInfo));
    if (vehicleInfo) {
      localStorage.setItem('vehicleInfo', JSON.stringify(vehicleInfo));
    }

    setToken(newToken);
    setDriver(driverInfo);
    setVehicle(vehicleInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverInfo');
    localStorage.removeItem('vehicleInfo');
    setToken(null);
    setDriver(null);
    setVehicle(null);
    setView('login');
  };

  const handleRouteSelected = (updatedVehicle) => {
    if (updatedVehicle) {
      localStorage.setItem('vehicleInfo', JSON.stringify(updatedVehicle));
      setVehicle(updatedVehicle);
    }
    setView('dashboard');
  };

  const handleChangeRoute = () => {
    setView('route-selection');
  };

  // Views where we want the Navbar
  const showNavbar = token && driver && (view === 'dashboard' || view === 'route-selection');

  return (
    <div className="app-container">
      {showNavbar && (
        <Navbar
          driver={driver}
          onLogout={handleLogout}
          onChangeRoute={handleChangeRoute}
        />
      )}

      {view === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setView('register')}
        />
      )}

      {view === 'register' && (
        <Register
          onRegisterSuccess={() => setView('login')}
          onSwitchToLogin={() => setView('login')}
        />
      )}

      {view === 'route-selection' && driver && (
        <RouteSelection
          driver={driver}
          token={token}
          onRouteSelected={handleRouteSelected}
        />
      )}

      {view === 'dashboard' && driver && (
        <Dashboard
          driver={driver}
          vehicle={vehicle}
          token={token}
        />
      )}
    </div>
  )
}

export default App
