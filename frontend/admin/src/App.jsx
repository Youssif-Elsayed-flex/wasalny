import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import DriversPage from './components/DriversPage'
import VehiclesPage from './components/VehiclesPage'
import RoutesPage from './components/RoutesPage'

const API_BASE = 'http://localhost:3000/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const adminData = localStorage.getItem('admin')
    if (token && adminData) {
      setIsLoggedIn(true)
      setAdmin(JSON.parse(adminData))
    }
  }, [])

  const handleLogin = (adminData) => {
    setIsLoggedIn(true)
    setAdmin(adminData)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin')
    setIsLoggedIn(false)
    setAdmin(null)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const pages = {
    dashboard: { title: 'لوحة التحكم', icon: '📊', component: Dashboard },
    drivers: { title: 'السائقين', icon: '👨‍✈️', component: DriversPage },
    vehicles: { title: 'العربيات', icon: '🚌', component: VehiclesPage },
    routes: { title: 'خطوط السير', icon: '🗺️', component: RoutesPage },
  }

  const CurrentPageComponent = pages[currentPage].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 border-l border-gray-100">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🚍
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                وصلني
              </h1>
              <p className="text-xs text-gray-500">لوحة التحكم</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {admin?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{admin?.name}</p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {Object.entries(pages).map(([key, page]) => (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentPage === key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
              >
                <span className="text-2xl">{page.icon}</span>
                <span className="font-semibold">{page.title}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 mt-8"
            >
              <span className="text-2xl">🚪</span>
              <span className="font-semibold">تسجيل الخروج</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-72 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{pages[currentPage].icon}</span>
            <h2 className="text-4xl font-bold text-gray-800">{pages[currentPage].title}</h2>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        {/* Page Content */}
        <CurrentPageComponent />
      </main>
    </div>
  )
}

export default App
