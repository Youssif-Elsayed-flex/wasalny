import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3000/api'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStatistics()
    }, [])

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/statistics`)
            const data = await response.json()
            if (data.success) {
                setStats(data.statistics)
            }
        } catch (error) {
            console.error('Error fetching statistics:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: 'العربيات النشطة',
            value: stats?.active_vehicles || 0,
            icon: '🚌',
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'from-emerald-50 to-teal-50'
        },
        {
            title: 'إجمالي السائقين',
            value: stats?.total_drivers || 0,
            icon: '👨‍✈️',
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'from-blue-50 to-indigo-50'
        },
        {
            title: 'السائقين النشطين',
            value: stats?.active_drivers || 0,
            icon: '✅',
            gradient: 'from-violet-500 to-purple-600',
            bg: 'from-violet-50 to-purple-50'
        },
        {
            title: 'خطوط السير',
            value: stats?.total_routes || 0,
            icon: '🗺️',
            gradient: 'from-orange-500 to-red-600',
            bg: 'from-orange-50 to-red-50'
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-60`}></div>
                        <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                    {card.icon}
                                </div>
                                <div className={`px-3 py-1 bg-gradient-to-r ${card.gradient} rounded-full text-xs text-white font-bold shadow-md`}>
                                    لحظي
                                </div>
                            </div>
                            <div className="text-5xl font-bold text-gray-800 mb-2">{card.value}</div>
                            <div className="text-gray-600 font-semibold">{card.title}</div>
                        </div>
                        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    </div>
                ))}
            </div>

            {/* Map Container */}
            <div className="card p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl">
                        🗺️
                    </span>
                    الخريطة التفاعلية
                </h3>
                <div className="relative h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden">
                    {/* Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                    <div className="relative text-center z-10 p-8">
                        <div className="text-6xl mb-4 animate-bounce">🗺️</div>
                        <p className="text-xl font-bold text-gray-700 mb-2">الخريطة التفاعلية</p>
                        <p className="text-gray-500">متطلب: Google Maps API Key</p>
                        <div className="mt-6 inline-block px-6 py-3 bg-white rounded-full shadow-lg text-sm text-gray-600">
                            <code className="font-mono">GOOGLE_MAPS_API_KEY</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 hover:scale-105 cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                    <div className="text-4xl mb-3">➕</div>
                    <h4 className="font-bold text-lg text-gray-800 mb-1">إضافة سائق جديد</h4>
                    <p className="text-sm text-gray-500">إنشاء حساب سائق جديد في النظام</p>
                </div>
                <div className="card p-6 hover:scale-105 cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-emerald-50">
                    <div className="text-4xl mb-3">🚗</div>
                    <h4 className="font-bold text-lg text-gray-800 mb-1">تسجيل عربية</h4>
                    <p className="text-sm text-gray-500">إضافة عربية جديدة للأسطول</p>
                </div>
                <div className="card p-6 hover:scale-105 cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                    <div className="text-4xl mb-3">📍</div>
                    <h4 className="font-bold text-lg text-gray-800 mb-1">خط سير جديد</h4>
                    <p className="text-sm text-gray-500">إنشاء مسار جديد للخدمة</p>
                </div>
            </div>
        </div>
    )
}
