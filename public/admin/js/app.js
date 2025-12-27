const { useState, useEffect } = React;

const API_BASE = '/api';

// Login Component
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin', JSON.stringify(data.admin));
                onLogin(data.admin);
            } else {
                setError(data.error || 'فشل تسجيل الدخول');
            }
        } catch (error) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">🚍</div>
                <h1 className="login-title">{window.t('app_name')}</h1>
                <p className="login-subtitle">{window.t('admin_panel')}</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{window.t('email')}</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="admin@wasalny.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{window.t('password')}</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '...' : window.t('login')}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Dashboard Component
function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStatistics();

        // Initialize Admin Map
        let map;
        // Check if the map container already has a Leaflet map initialized
        // This prevents re-initialization on re-renders
        if (document.getElementById('admin-map') && !document.getElementById('admin-map')._leaflet_id) {
            map = L.map('admin-map').setView([30.0444, 31.2357], 12); // Set initial view to Cairo
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Fetch and show markers
            const fetchMarkers = async () => {
                try {
                    const res = await fetch(`${API_BASE}/admin/vehicles`);
                    const data = await res.json();
                    if (data.success) {
                        data.vehicles.forEach(v => {
                            if (v.latitude && v.longitude) {
                                L.marker([v.latitude, v.longitude])
                                    .addTo(map)
                                    .bindPopup(`<b>${v.plate_number}</b><br>${v.driver_name || ''}`);
                            }
                        });
                    }
                } catch (err) {
                    console.error('Error fetching vehicle locations:', err);
                }
            };
            fetchMarkers();
        }

        // Placeholder for WebSocket cleanup if implemented later
        // return () => {
        //     if (ws) ws.disconnect();
        // };
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/statistics`);
            const data = await response.json();
            if (data.success) {
                setStats(data.statistics);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ '--icon-bg': 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>👨‍✈️</div>
                        <div className="stat-badge">+{stats?.active_drivers || 0}</div>
                    </div>
                    <div className="stat-value">{stats?.total_drivers || 0}</div>
                    <div className="stat-label">{window.t('drivers_count')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ '--icon-bg': 'linear-gradient(135deg, #10b981, #059669)' }}>🚌</div>
                        <div className="stat-badge">+{stats?.active_vehicles || 0}</div>
                    </div>
                    <div className="stat-value">{stats?.total_vehicles || 0}</div>
                    <div className="stat-label">{window.t('vehicles_count')}</div>
                </div>
                <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, #f59e0b, #d97706)' }}>
                    <div className="stat-header">
                        <div className="stat-icon" style={{ '--icon-bg': 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🗺️</div>
                    </div>
                    <div className="stat-value">{stats?.total_routes || 0}</div>
                    <div className="stat-label">{window.t('active_routes')}</div>
                </div>
            </div>
            <div className="map-container">
                <div id="admin-map" style={{ width: '100%', height: '500px', borderRadius: '1rem' }}>
                    {/* Map will be initialized here by Leaflet */}
                </div>
            </div>
        </div>
    );
}

// Drivers Management
function DriversManagement() {
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/drivers`);
            const data = await response.json();
            if (data.success) {
                setDrivers(data.drivers);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السائق؟')) return;

        try {
            const response = await fetch(`${API_BASE}/admin/drivers/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchDrivers();
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    return (
        <div>
            {showModal && (
                <DriverModal
                    driver={editingDriver}
                    onClose={() => {
                        setShowModal(false);
                        setEditingDriver(null);
                    }}
                    onSave={() => {
                        fetchDrivers();
                        setShowModal(false);
                        setEditingDriver(null);
                    }}
                />
            )}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>الإجراءات</th>
                            <th>الحالة</th>
                            <th>رقم الهاتف</th>
                            <th>الاسم</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map(driver => (
                            <tr key={driver.id}>
                                <td>
                                    <div className="actions-group">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setEditingDriver(driver);
                                                setShowModal(true);
                                            }}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(driver.id)}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${driver.status}`}>
                                        {driver.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td>{driver.phone}</td>
                                <td>{driver.name}</td>
                                <td>{driver.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Driver Modal
function DriverModal({ driver, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: driver?.name || '',
        phone: driver?.phone || '',
        password: '',
        status: driver?.status || 'inactive'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = driver
                ? `${API_BASE}/admin/drivers/${driver.id}`
                : `${API_BASE}/admin/drivers`;

            const method = driver ? 'PUT' : 'POST';

            const body = driver
                ? { name: formData.name, phone: formData.phone, status: formData.status }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success) {
                onSave();
            } else {
                alert(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error saving driver:', error);
            alert('خطأ في الاتصال بالخادم');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">{driver ? 'تعديل سائق' : 'إضافة سائق جديد'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">الاسم</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">رقم الهاتف</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    {!driver && (
                        <div className="form-group">
                            <label className="form-label">كلمة المرور</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-danger" onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className="btn btn-primary">
                            حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Vehicles Management (Similar to Drivers)
function VehiclesManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
        fetchDrivers();
        fetchRoutes();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/vehicles`);
            const data = await response.json();
            if (data.success) setVehicles(data.vehicles);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/drivers`);
            const data = await response.json();
            if (data.success) setDrivers(data.drivers);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/routes`);
            const data = await response.json();
            if (data.success) setRoutes(data.routes);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه العربية؟')) return;
        try {
            const response = await fetch(`${API_BASE}/admin/vehicles/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) fetchVehicles();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {showModal && (
                <VehicleModal
                    vehicle={editingVehicle}
                    drivers={drivers}
                    routes={routes}
                    onClose={() => {
                        setShowModal(false);
                        setEditingVehicle(null);
                    }}
                    onSave={() => {
                        fetchVehicles();
                        setShowModal(false);
                        setEditingVehicle(null);
                    }}
                />
            )}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>الإجراءات</th>
                            <th>الحالة</th>
                            <th>خط السير</th>
                            <th>السائق</th>
                            <th>رقم اللوحة</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map(vehicle => (
                            <tr key={vehicle.id}>
                                <td>
                                    <div className="actions-group">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setEditingVehicle(vehicle);
                                                setShowModal(true);
                                            }}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(vehicle.id)}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${vehicle.status}`}>
                                        {vehicle.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td>{vehicle.route_name || '-'}</td>
                                <td>{vehicle.driver_name || '-'}</td>
                                <td>{vehicle.plate_number}</td>
                                <td>{vehicle.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Vehicle Modal
function VehicleModal({ vehicle, drivers, routes, onClose, onSave }) {
    const [formData, setFormData] = useState({
        plate_number: vehicle?.plate_number || '',
        driver_id: vehicle?.driver_id || '',
        route_id: vehicle?.route_id || '',
        status: vehicle?.status || 'inactive'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = vehicle
                ? `${API_BASE}/admin/vehicles/${vehicle.id}`
                : `${API_BASE}/admin/vehicles`;
            const method = vehicle ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                onSave();
            } else {
                alert(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('خطأ في الاتصال بالخادم');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">{vehicle ? 'تعديل عربية' : 'إضافة عربية جديدة'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">رقم اللوحة</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.plate_number}
                            onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">السائق</label>
                        <select
                            className="form-select"
                            value={formData.driver_id}
                            onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                        >
                            <option value="">اختر سائق</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">خط السير</label>
                        <select
                            className="form-select"
                            value={formData.route_id}
                            onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                        >
                            <option value="">اختر خط سير</option>
                            {routes.map(route => (
                                <option key={route.id} value={route.id}>{route.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-danger" onClick={onClose}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Routes Management (Similar structure)
function RoutesManagement() {
    const [routes, setRoutes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/routes`);
            const data = await response.json();
            if (data.success) setRoutes(data.routes);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الخط؟')) return;
        try {
            const response = await fetch(`${API_BASE}/admin/routes/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) fetchRoutes();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {showModal && (
                <RouteModal
                    route={editingRoute}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRoute(null);
                    }}
                    onSave={() => {
                        fetchRoutes();
                        setShowModal(false);
                        setEditingRoute(null);
                    }}
                />
            )}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>الإجراءات</th>
                            <th>الحالة</th>
                            <th>نقطة النهاية</th>
                            <th>نقطة البداية</th>
                            <th>اسم الخط</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map(route => (
                            <tr key={route.id}>
                                <td>
                                    <div className="actions-group">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setEditingRoute(route);
                                                setShowModal(true);
                                            }}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(route.id)}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${route.status}`}>
                                        {route.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td>{route.end_point}</td>
                                <td>{route.start_point}</td>
                                <td>{route.name}</td>
                                <td>{route.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Route Modal
function RouteModal({ route, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: route?.name || '',
        start_point: route?.start_point || '',
        end_point: route?.end_point || '',
        status: route?.status || 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = route
                ? `${API_BASE}/admin/routes/${route.id}`
                : `${API_BASE}/admin/routes`;
            const method = route ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                onSave();
            } else {
                alert(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('خطأ في الاتصال بالخادم');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">{route ? 'تعديل خط' : 'إضافة خط جديد'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">اسم الخط</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">نقطة البداية</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.start_point}
                            onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">نقطة النهاية</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.end_point}
                            onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-danger" onClick={onClose}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Main Admin App
function AdminApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin');
        if (token && adminData) {
            setIsLoggedIn(true);
            setAdmin(JSON.parse(adminData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        setIsLoggedIn(false);
        setAdmin(null);
    };

    if (!isLoggedIn) {
        return <LoginPage onLogin={(adminData) => {
            setIsLoggedIn(true);
            setAdmin(adminData);
        }} />;
    }

    const pages = {
        dashboard: { title: window.t('dashboard'), component: Dashboard },
        drivers: { title: window.t('manage_drivers'), component: DriversManagement },
        vehicles: { title: window.t('manage_vehicles'), component: VehiclesManagement },
        routes: { title: window.t('manage_routes'), component: RoutesManagement }
    };

    const CurrentPageComponent = pages[currentPage].component;

    return (
        <div className="admin-container">
            <div className="sidebar">
                <div className="logo-section">
                    <div className="logo-icon">🚍</div>
                    <div>
                        <h1 className="logo-text">{window.t('app_name')}</h1>
                        <p className="logo-subtitle">{window.t('admin_panel')}</p>
                    </div>
                </div>

                <div className="admin-info">
                    <div className="admin-avatar">A</div>
                    <div style={{ marginRight: '60px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{admin?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Admin</div>
                    </div>
                </div>

                <ul className="nav-menu">
                    <li className="nav-item">
                        <div className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentPage('dashboard')}>
                            <span className="nav-icon">📊</span>
                            {window.t('dashboard')}
                        </div>
                    </li>
                    <li className="nav-item">
                        <div className={`nav-link ${currentPage === 'drivers' ? 'active' : ''}`}
                            onClick={() => setCurrentPage('drivers')}>
                            <span className="nav-icon">👤</span>
                            {window.t('manage_drivers')}
                        </div>
                    </li>
                    <li className="nav-item">
                        <div className={`nav-link ${currentPage === 'vehicles' ? 'active' : ''}`}
                            onClick={() => setCurrentPage('vehicles')}>
                            <span className="nav-icon">🚌</span>
                            {window.t('manage_vehicles')}
                        </div>
                    </li>
                    <li className="nav-item">
                        <div className={`nav-link ${currentPage === 'routes' ? 'active' : ''}`}
                            onClick={() => setCurrentPage('routes')}>
                            <span className="nav-icon">🗺️</span>
                            {window.t('manage_routes')}
                        </div>
                    </li>
                    <li className="nav-item" style={{ marginTop: '2rem' }}>
                        <div className="nav-link" onClick={handleLogout} style={{ color: '#ef4444' }}>
                            <span className="nav-icon">🚪</span>
                            {window.t('logout')}
                        </div>
                    </li>
                </ul>
            </div>
            <div className="main-content">
                <div className="header">
                    <h1 className="page-title">{pages[currentPage].title}</h1>
                    {currentPage !== 'dashboard' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            + إضافة جديد
                        </button>
                    )}
                </div>
                <CurrentPageComponent />
            </div>
        </div>
    );
}

// Render App
ReactDOM.render(<AdminApp />, document.getElementById('root'));
