export default function VehiclesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">إدارة العربيات</h3>
                <button className="btn-primary">
                    <span>➕</span>
                    إضافة عربية جديدة
                </button>
            </div>

            <div className="card p-6">
                <div className="text-center py-20 text-gray-500">
                    <div className="text-6xl mb-4">🚌</div>
                    <p className="text-xl font-semibold">قريباً - صفحة إدارة العربيات</p>
                    <p className="mt-2">سيتم تطويرها قريباً مع كامل وظائف CRUD</p>
                </div>
            </div>
        </div>
    )
}
