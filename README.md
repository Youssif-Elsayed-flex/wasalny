# 🚍 Wasalny (وصلني) - Real-Time Public Transportation Tracking System

A comprehensive GPS-based transportation tracking system connecting drivers, passengers, and administrators in real-time.

## 📋 Overview

Wasalny is a real-time public transportation tracking system designed for microbuses and buses. It provides three interfaces:
- **Admin Dashboard**: Manage drivers, vehicles, and routes
- **Driver App**: Send GPS location updates and manage service status
- **Passenger App**: Track live vehicles and find nearest transport

## ✨ Features

### Admin Dashboard
- ✅ Complete CRUD for drivers, vehicles, and routes
- ✅ Live vehicle tracking on map
- ✅ Real-time statistics dashboard
- ✅ Status management (activate/deactivate)

### Driver Application
- ✅ GPS location tracking
- ✅ Automatic location updates every 5 seconds
- ✅ Service status toggle (Active/Inactive)
- ✅ Real-time synchronization via WebSocket

### Passenger Application
- ✅ View all active vehicles in real-time
- ✅ Filter vehicles by route
- ✅ Calculate nearest vehicle with distance
- ✅ ETA calculation based on speed and distance
- ✅ Live updates via WebSocket

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Real-time**: Socket.io (WebSocket)
- **Frontend**: React (via CDN)
- **Styling**: Custom CSS with Arabic RTL support
- **Maps**: Google Maps JavaScript API (requires API key)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Step 1: Clone and Install Dependencies

```bash
cd "d:\eshmawy project"
npm install
```

### Step 2: Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wasalny
DB_PORT=3306

# Server Configuration
PORT=3000

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_here

# Google Maps API Key (optional for MVP)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Step 3: Setup Database

1. Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

2. Create default admin account:

The schema includes a default admin account. You need to hash a password first:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Copy the hashed password and update the schema.sql INSERT statement for the admin, or manually insert via MySQL:

```sql
USE wasalny;
INSERT INTO admins (name, email, password) VALUES 
('Admin', 'admin@wasalny.com', 'YOUR_HASHED_PASSWORD_HERE');
```

### Step 4: Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🚀 Usage

### Admin Dashboard
1. Navigate to `http://localhost:3000/admin`
2. Login with:
   - Email: `admin@wasalny.com`
   - Password: `admin123` (or whatever you set)
3. Manage drivers, vehicles, and routes
4. View live vehicle tracking

### Driver App
1. Navigate to `http://localhost:3000/driver`
2. Login with driver phone and password (created via admin panel)
3. Toggle service status to "Active"
4. Allow browser location access
5. GPS will automatically send location updates

### Passenger App
1. Navigate to `http://localhost:3000/passenger`
2. No login required
3. View live vehicles on the map
4. Filter by route
5. See nearest vehicle and ETA

## 📁 Project Structure

```
wasalny/
├── server.js                 # Main server entry point
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── database/
│   └── schema.sql           # Database schema
├── routes/
│   ├── admin.js             # Admin API routes
│   ├── driver.js            # Driver API routes
│   └── passenger.js         # Passenger API routes
├── utils/
│   ├── database.js          # Database connection
│   ├── auth.js              # JWT authentication
│   └── eta.js               # ETA calculations
├── websocket/
│   └── locationHandler.js   # WebSocket handlers
└── public/
    ├── admin/               # Admin dashboard
    │   ├── index.html
    │   ├── css/admin.css
    │   └── js/app.js
    ├── driver/              # Driver application
    │   ├── index.html
    │   ├── css/driver.css
    │   └── js/app.js
    └── passenger/           # Passenger application
        ├── index.html
        ├── css/passenger.css
        └── js/app.js
```

## 🔌 API Endpoints

### Driver Endpoints
- `POST /api/driver/login` - Driver login
- `POST /api/driver/location` - Update location
- `PUT /api/driver/status` - Update status
- `GET /api/driver/profile/:id` - Get profile

### Passenger Endpoints
- `GET /api/vehicles/live` - Get all active vehicles
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id/vehicles` - Get vehicles on route
- `POST /api/vehicles/nearest` - Find nearest vehicle

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET/POST/PUT/DELETE /api/admin/drivers` - CRUD drivers
- `GET/POST/PUT/DELETE /api/admin/vehicles` - CRUD vehicles
- `GET/POST/PUT/DELETE /api/admin/routes` - CRUD routes
- `GET /api/admin/statistics` - Get statistics

## 🔗 WebSocket Events

### From Driver
- `driver:location` - Send location update
- `driver:status` - Send status change

### To Passengers
- `vehicle:update` - Vehicle location updated
- `vehicle:status` - Vehicle status changed
- `vehicles:list` - List of all vehicles

## 🗺️ Google Maps Integration (Optional)

To enable map visualization:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
3. Add the API key to your `.env` file
4. Update the HTML files to include Google Maps script:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

## 🧪 Testing

### Manual Testing

1. **Create Test Data**:
   - Login to admin dashboard
   - Create a route (e.g., "Ramses - Maadi")
   - Create a driver
   - Create a vehicle and assign to driver and route

2. **Test Driver App**:
   - Login with driver credentials
   - Toggle status to "Active"
   - Verify GPS is sending location
   - Check database for location entries

3. **Test Passenger App**:
   - Open passenger app
   - Verify vehicle appears in the list
   - Check nearest vehicle calculation
   - Verify ETA is displayed

4. **Test Real-time Updates**:
   - Open passenger app in one browser
   - Open driver app in another
   - Move driver location
   - Verify passenger app updates automatically

## 🔒 Security Notes

- Change the default JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use environment variables for secrets
- Hash all passwords with bcrypt

## 🚧 Future Enhancements (Phase 2)

- [ ] Payment integration
- [ ] Passenger capacity tracking
- [ ] Driver ratings and reviews
- [ ] Push notifications
- [ ] Trip history
- [ ] Advanced analytics
- [ ] Mobile native apps (React Native)

## 📝 License

This project is provided as-is for educational and commercial use.

## 👥 Support

For issues or questions, please file an issue on the project repository.

---

**Made with ❤️ for better public transportation in Egypt**
