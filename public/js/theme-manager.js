// Theme and Language Manager
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.lang = localStorage.getItem('lang') || 'ar';
        this.init();
    }

    init() {
        this.applyTheme();
        this.applyLanguage();
        this.createToggles();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    applyLanguage() {
        document.documentElement.setAttribute('lang', this.lang);
        document.documentElement.setAttribute('dir', this.lang === 'ar' ? 'rtl' : 'ltr');
        this.translatePage();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
        this.updateToggleButton();
    }

    toggleLanguage() {
        this.lang = this.lang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('lang', this.lang);
        this.applyLanguage();
        this.updateLangButton();
        window.location.reload(); // Simple way to re-render React and update direction
    }

    createToggles() {
        // Theme Toggle
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-toggle';
        themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
        themeBtn.onclick = () => this.toggleTheme();
        themeBtn.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(themeBtn);
        this.themeBtn = themeBtn;

        // Language Toggle
        const langBtn = document.createElement('button');
        langBtn.className = 'lang-toggle';
        langBtn.innerHTML = `<span class="lang-icon">🌐</span><span>${this.lang === 'ar' ? 'English' : 'عربي'}</span>`;
        langBtn.onclick = () => this.toggleLanguage();
        langBtn.setAttribute('aria-label', 'Toggle language');
        document.body.appendChild(langBtn);
        this.langBtn = langBtn;
    }

    updateToggleButton() {
        if (this.themeBtn) {
            this.themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    updateLangButton() {
        if (this.langBtn) {
            this.langBtn.innerHTML = `<span class="lang-icon">🌐</span><span>${this.lang === 'ar' ? 'English' : 'عربي'}</span>`;
        }
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[this.lang] && translations[this.lang][key]) {
                element.textContent = translations[this.lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[this.lang] && translations[this.lang][key]) {
                element.placeholder = translations[this.lang][key];
            }
        });
    }
}

// Translations
const translations = {
    ar: {
        'app_name': 'وصلني',
        'wasalny': 'وصلني',
        'home': 'الرئيسية',
        'register_driver': 'تسجيل سائق',
        'track_bus': 'تتبع المواصلات',
        'book_trip': 'احجز رحلة',
        'admin_login': 'دخول الإدارة',
        'hero_title': 'تتبع المواصلات في الوقت الحقيقي',
        'hero_subtitle': 'نظام متطور لتتبع الميكروباصات والأتوبيسات باستخدام تقنية GPS',
        'track_now': 'تتبع المواصلات الآن',
        'hero_title_accent': 'في الوقت الحقيقي',
        'register_as_driver': 'سجل كسائق',
        'features': 'المميزات',
        'features_subtitle': 'نظام شامل ومتكامل لتتبع المواصلات',
        'live_tracking': 'تتبع لحظي',
        'live_tracking_desc': 'متابعة موقع العربيات في الوقت الفعلي على الخريطة',
        'eta': 'وقت الوصول',
        'eta_desc': 'حساب دقيق للوقت المتوقع لوصول العربية',
        'nearest_bus': 'أقرب عربية',
        'nearest_bus_desc': 'معرفة أقرب ميكروباص أو أتوبيس لموقعك',
        'instant_updates': 'تحديثات فورية',
        'instant_updates_desc': 'إشعارات لحظية عند اقتراب العربية',
        'routes': 'خطوط السير',
        'routes_desc': 'عرض جميع الخطوط المتاحة والمسارات',
        'dashboard': 'لوحة تحكم',
        'dashboard_desc': 'إدارة كاملة للسائقين والعربيات',
        'are_you_driver': 'هل أنت سائق؟',
        'register_now': 'سجل الآن',
        'cta_subtitle': 'سجل الآن وابدأ في خدمة الركاب بنظام تتبع احترافي',
        'all_rights': '© 2024 وصلني - جميع الحقوق محفوظة',
        'register_new_driver': 'تسجيل سائق جديد',
        'join_network': 'انضم إلى شبكة وصلني وابدأ في خدمة الركاب',
        // Admin
        'admin_panel': 'لوحة تحكم الإدارة',
        'drivers_count': 'عدد السائقين',
        'vehicles_count': 'عدد العربيات',
        'active_routes': 'الخطوط النشطة',
        'manage_drivers': 'إدارة السائقين',
        'manage_vehicles': 'إدارة العربيات',
        'manage_routes': 'إدارة الخطوط',
        'logout': 'تسجيل خروج',
        'login': 'تسجيل دخول',
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'phone': 'رقم الهاتف',
        'name': 'الاسم',
        'plate_number': 'رقم اللوحة',
        'route': 'الخط',
        'status': 'الحالة',
        'actions': 'الإجراءات',
        'add_driver': 'إضافة سائق',
        'add_vehicle': 'إضافة عربية',
        'add_route': 'إضافة خط',
        'edit': 'تعديل',
        'delete': 'حذف',
        'save': 'حفظ',
        'cancel': 'إلغاء',
        'active': 'نشط',
        'inactive': 'غير نشط',
        // Driver
        'driver_app': 'تطبيق السائق',
        'start_trip': 'بدء الرحلة',
        'stop_trip': 'إنهاء الرحلة',
        'online': 'متصل',
        'offline': 'غير متصل',
        'welcome_driver': 'أهلاً بك يا كابتن',
        // Passenger
        'passenger_app': 'تتبع المواصلات',
        'find_nearest': 'البحث عن أقرب عربية',
        'select_route': 'اختر الخط',
        'all_vehicles': 'جميع العربيات المتاحة',
        'no_vehicles': 'لا توجد عربيات متاحة حالياً',
        'searching': 'جاري البحث...',
        'back_to_home': 'العودة للرئيسية',
        'book_trip_now': 'احجز رحلتك الآن',
        'set_location_on_map': 'حدد موقعك على الخريطة',
        'search_pickup': 'ابحث عن نقطة الانطلاق',
        'search_dropoff': 'ابحث عن نقطة الوصول',
        'search_placeholder': 'اكتب اسم المكان أو العنوان...',
        'or_click_map': 'أو اضغط على الخريطة مباشرة',
        'pickup_point': 'نقطة الانطلاق',
        'dropoff_point': 'نقطة الوصول',
        'from': 'من',
        'to': 'إلى',
        'click_map_pickup': 'اضغط على الخريطة لتحديد موقع الانطلاق',
        'click_map_dropoff': 'اضغط على الخريطة لتحديد موقع الوصول',
        'booking_details': 'بيانات الحجز',
        'full_name': 'الاسم الكامل',
        'name_placeholder': 'أدخل اسمك',
        'confirm_booking': 'تأكيد الحجز',
        'trip_datetime': 'تاريخ ووقت الرحلة',
        'passengers_count': 'عدد الركاب',
        'one_passenger': 'راكب واحد',
        'two_passengers': '2 ركاب',
        'three_passengers': '3 ركاب',
        'four_passengers': '4 ركاب',
        'five_plus_passengers': '5+ ركاب',
        'additional_notes': 'ملاحظات إضافية',
        'notes_placeholder': 'أي تعليمات أو طلبات خاصة...',
        'trip_summary': 'ملخص الرحلة',
        'approx_distance': 'المسافة التقريبية',
        'expected_duration': 'الوقت المتوقع',
        'approx_price': 'السعر التقريبي',
        'footer_text': 'نظام متطور لتتبع المواصلات العامة',
        'location_tracking': 'تتبع الموقع',
        'sending_realtime': 'يتم الإرسال لحظيًا',
        'tracking_status': 'حالة التتبع',
        'active_status': 'نشط',
        'inactive_status': 'متوقف',
        'latitude': 'خط العرض',
        'longitude': 'خط الطول',
        'speed': 'السرعة',
        'km_per_hour': 'كم/ساعة',
        'last_update': 'آخر تحديث',
        'failed_to_update_status': 'فشل تحديث الحالة'
    },
    en: {
        'app_name': 'Wasalny',
        'wasalny': 'Wasalny',
        'home': 'Home',
        'register_driver': 'Driver Registration',
        'track_bus': 'Track Transport',
        'book_trip': 'Book Trip',
        'admin_login': 'Admin Login',
        'hero_title': 'Real-Time Transport Tracking',
        'hero_subtitle': 'Advanced system for tracking microbuses and buses using GPS technology',
        'track_now': 'Track Now',
        'hero_title_accent': 'in Real-time',
        'register_as_driver': 'Register as Driver',
        'features': 'Features',
        'features_subtitle': 'Comprehensive and integrated transport tracking system',
        'live_tracking': 'Live Tracking',
        'live_tracking_desc': 'Follow vehicle locations in real-time on the map',
        'eta': 'Arrival Time',
        'eta_desc': 'Accurate calculation of expected vehicle arrival time',
        'nearest_bus': 'Nearest Bus',
        'nearest_bus_desc': 'Find the nearest microbus or bus to your location',
        'instant_updates': 'Instant Updates',
        'instant_updates_desc': 'Real-time notifications when the vehicle approaches',
        'routes': 'Routes',
        'routes_desc': 'View all available routes and paths',
        'dashboard': 'Dashboard',
        'dashboard_desc': 'Complete management of drivers and vehicles',
        'are_you_driver': 'Are you a driver?',
        'register_now': 'Register Now',
        'cta_subtitle': 'Register now and start serving passengers with a professional tracking system',
        'all_rights': '© 2024 Wasalny - All Rights Reserved',
        'register_new_driver': 'Register New Driver',
        'join_network': 'Join the Wasalny network and start serving passengers',
        // Admin
        'admin_panel': 'Admin Dashboard',
        'drivers_count': 'Total Drivers',
        'vehicles_count': 'Total Vehicles',
        'active_routes': 'Active Routes',
        'manage_drivers': 'Drivers Management',
        'manage_vehicles': 'Vehicles Management',
        'manage_routes': 'Routes Management',
        'logout': 'Logout',
        'login': 'Login',
        'email': 'Email',
        'password': 'Password',
        'phone': 'Phone Number',
        'name': 'Name',
        'plate_number': 'Plate Number',
        'route': 'Route',
        'status': 'Status',
        'actions': 'Actions',
        'add_driver': 'Add Driver',
        'add_vehicle': 'Add Vehicle',
        'add_route': 'Add Route',
        'edit': 'Edit',
        'delete': 'Delete',
        'save': 'Save',
        'cancel': 'Cancel',
        'active': 'Active',
        'inactive': 'Inactive',
        // Driver
        'driver_app': 'Driver App',
        'start_trip': 'Start Trip',
        'stop_trip': 'Stop Trip',
        'online': 'Online',
        'offline': 'Offline',
        'welcome_driver': 'Welcome, Captain',
        // Passenger
        'passenger_app': 'Transport Tracking',
        'find_nearest': 'Find Nearest Vehicle',
        'select_route': 'Select Route',
        'all_vehicles': 'All Available Vehicles',
        'no_vehicles': 'No vehicles available right now',
        'searching': 'Searching...',
        'back_to_home': 'Back to Home',
        'book_trip_now': 'Book Your Trip Now',
        'set_location_on_map': 'Set your location on the map',
        'search_pickup': 'Search for pickup point',
        'search_dropoff': 'Search for dropoff point',
        'search_placeholder': 'Type place name or address...',
        'or_click_map': 'Or click directly on the map',
        'pickup_point': 'Pickup Point',
        'dropoff_point': 'Dropoff Point',
        'from': 'From',
        'to': 'To',
        'click_map_pickup': 'Click map to set pickup location',
        'click_map_dropoff': 'Click map to set dropoff location',
        'booking_details': 'Booking Details',
        'full_name': 'Full Name',
        'name_placeholder': 'Enter your name',
        'confirm_booking': 'Confirm Booking',
        'trip_datetime': 'Trip Date & Time',
        'passengers_count': 'Passengers Count',
        'one_passenger': 'One Passenger',
        'two_passengers': '2 Passengers',
        'three_passengers': '3 Passengers',
        'four_passengers': '4 Passengers',
        'five_plus_passengers': '5+ Passengers',
        'additional_notes': 'Additional Notes',
        'notes_placeholder': 'Any instructions or special requests...',
        'trip_summary': 'Trip Summary',
        'approx_distance': 'Approx Distance',
        'expected_duration': 'Expected Duration',
        'approx_price': 'Approx Price',
        'footer_text': 'Advanced public transport tracking system',
        'location_tracking': 'Location Tracking',
        'sending_realtime': 'Sending Real-time',
        'tracking_status': 'Tracking Status',
        'active_status': 'Active',
        'inactive_status': 'Stopped',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'speed': 'Speed',
        'km_per_hour': 'km/h',
        'last_update': 'Last Update',
        'failed_to_update_status': 'Failed to update status'
    }
};

// Initialize on page load
let themeManager;
const initTheme = () => {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
    window.t = (key) => {
        const lang = localStorage.getItem('lang') || 'ar';
        return (translations[lang] && translations[lang][key]) || key;
    };
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
