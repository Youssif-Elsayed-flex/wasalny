import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import RouteSelection from './components/RouteSelection'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('driverToken'));
  const [driver, setDriver] = useState(JSON.parse(localStorage.getItem('driverInfo') || 'null'));
  const [vehicle, setVehicle] = useState(JSON.parse(localStorage.getItem('vehicleInfo') || 'null'));

  // Views: login, register, route-selection, dashboard
  const [view, setView] = useState('login');

  useEffect(() => {
    if (token && driver) {
      if (vehicle) {
        setView('dashboard');
      } else {
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

  const handleRouteSelected = () => {
    // Refresh vehicle info or just set a flag. 
    // Ideally we fetch the vehicle info again, but for now let's assume success means we are good.
    // We can simulate vehicle object to proceed.
    const newVehicle = { status: 'inactive' }; // details irrelevant for now, just need existence
    localStorage.setItem('vehicleInfo', JSON.stringify(newVehicle));
    setVehicle(newVehicle);
    setView('dashboard');
  };

  return (
    <div className="app-container">
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
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
