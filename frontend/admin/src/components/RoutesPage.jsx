export default function RoutesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">إدارة خطوط السير</h3>
                <button className="btn-primary">
                    <span>➕</span>
                    إضافة خط جديد
                </button>
            </div>

            <div className="card p-6">
                <div className="text-center py-20 text-gray-500">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-xl font-semibold">قريباً - صفحة إدارة خطوط السير</p>
                    <p className="mt-2">سيتم تطويرها قريباً مع كامل وظائف CRUD</p>
                </div>
            </div>
        </div>
    )
}
