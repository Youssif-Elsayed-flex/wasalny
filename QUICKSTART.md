# Quick Start Guide - Wasalny

## Prerequisites
- Node.js installed
- MySQL installed and running
- Terminal/Command Prompt access

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Copy `.env.example` to `.env`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Or manually create .env file and add:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wasalny
PORT=3000
JWT_SECRET=change_this_secret_key
```

### 3. Setup Database
```bash
mysql -u root -p < database/schema.sql
```

**Default Login Credentials:**
- Admin Email: `admin@wasalny.com`
- Admin Password: `admin123`
- Test Driver Phone: `01234567890`
- Test Driver Password: `driver123`

### 4. Start Server
```bash
npm run dev
```

### 5. Access Applications
- Admin Dashboard: http://localhost:3000/admin
- Driver App: http://localhost:3000/driver
- Passenger App: http://localhost:3000/passenger
- API Health Check: http://localhost:3000/health

## Testing the System

1. **Login to Admin** (http://localhost:3000/admin)
   - Email: admin@wasalny.com
   - Password: admin123
   - Create additional drivers, vehicles, routes as needed

2. **Login as Driver** (http://localhost:3000/driver)
   - Phone: 01234567890
   - Password: driver123
   - Toggle status to "Active"
   - Allow location access

3. **View as Passenger** (http://localhost:3000/passenger)
   - No login required
   - See active vehicles
   - Check nearest vehicle

## Common Issues

### Database Connection Fails
- Check MySQL is running
- Verify `.env` credentials
- Ensure database exists: `CREATE DATABASE wasalny;`

### Location Not Updating
- Allow browser location access
- Use HTTPS in production (required for geolocation)
- Check driver status is "Active"

### WebSocket Connection Issues
- Check firewall/antivirus settings
- Verify port 3000 is available
- Check browser console for errors

## Next Steps
- Change default passwords in production
- Add Google Maps API key for map visualization
- Configure HTTPS for production deployment
- Add more routes, drivers, and vehicles via admin panel
