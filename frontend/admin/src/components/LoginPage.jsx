import { useState } from 'react'

const API_BASE = 'http://localhost:3000/api'

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (data.success) {
                localStorage.setItem('admin_token', data.token)
                localStorage.setItem('admin', JSON.stringify(data.admin))
                onLogin(data.admin)
            } else {
                setError(data.error || 'فشل تسجيل الدخول')
            }
        } catch (error) {
            setError('خطأ في الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-10 right-10 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 left-10 animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/90 to-white/70 rounded-3xl flex items-center justify-center text-5xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                            🚍
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">وصلني</h1>
                        <p className="text-blue-100">لوحة تحكم الإدارة</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-300/50 rounded-xl text-white text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white font-semibold mb-2 mr-1">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@wasalny.com"
                                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-300"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">✉️</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 mr-1">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-300"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔐</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-white to-blue-50 text-blue-600 font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري التحميل...
                                </span>
                            ) : (
                                'تسجيل الدخول'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-white/60 text-sm">
                        <p>المتصفح الافتراضي: admin@wasalny.com</p>
                        <p>كلمة المرور: admin123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
