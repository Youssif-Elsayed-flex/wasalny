import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('driverToken'));
  const [driver, setDriver] = useState(JSON.parse(localStorage.getItem('driverInfo') || 'null'));
  const [view, setView] = useState(token ? 'dashboard' : 'login');

  useEffect(() => {
    if (token && driver) {
      setView('dashboard');
    } else {
      setView('login');
    }
  }, [token, driver]);

  const handleLogin = (newToken, driverInfo) => {
    localStorage.setItem('driverToken', newToken);
    localStorage.setItem('driverInfo', JSON.stringify(driverInfo));
    setToken(newToken);
    setDriver(driverInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverInfo');
    setToken(null);
    setDriver(null);
    setView('login');
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

      {view === 'dashboard' && driver && (
        <Dashboard
          driver={driver}
          token={token}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
