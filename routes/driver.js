const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');
const { generateToken, comparePassword, hashPassword } = require('../utils/auth');

// Driver Registration
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Name, phone, and password are required' });
        }

        // Check if driver already exists
        const existing = await query('SELECT id FROM drivers WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'رقم الهاتف مسجل بالفعل' });
        }

        const hashedPassword = await hashPassword(password);

        const result = await query(
            'INSERT INTO drivers (name, phone, password, status) VALUES (?, ?, ?, ?)',
            [name, phone, hashedPassword, 'inactive']
        );

        res.json({
            success: true,
            message: 'تم التسجيل بنجاح. يمكنك تسجيل الدخول الآن.',
            driver_id: result.insertId
        });

    } catch (error) {
        console.error('Driver registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Driver Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        // Get driver by phone
        const drivers = await query(
            'SELECT * FROM drivers WHERE phone = ?',
            [phone]
        );

        if (drivers.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const driver = drivers[0];

        // Verify password
        const isValid = await comparePassword(password, driver.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken({
            id: driver.id,
            role: 'driver',
            phone: driver.phone
        });

        // Get assigned vehicle
        const vehicles = await query(
            'SELECT v.*, r.name as route_name FROM vehicles v LEFT JOIN routes r ON v.route_id = r.id WHERE v.driver_id = ?',
            [driver.id]
        );

        res.json({
            success: true,
            token,
            driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                status: driver.status
            },
            vehicle: vehicles.length > 0 ? vehicles[0] : null
        });

    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Driver Location
router.post('/location', async (req, res) => {
    try {
        const { driver_id, vehicle_id, latitude, longitude, speed, status } = req.body;

        if (!vehicle_id || !latitude || !longitude) {
            return res.status(400).json({ error: 'Vehicle ID, latitude, and longitude are required' });
        }

        // Insert location
        await query(
            'INSERT INTO locations (vehicle_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)',
            [vehicle_id, latitude, longitude, speed || 0]
        );

        // Update vehicle status if provided
        if (status) {
            await query(
                'UPDATE vehicles SET status = ? WHERE id = ?',
                [status, vehicle_id]
            );
        }

        res.json({ success: true, message: 'Location updated' });

    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Driver Status
router.put('/status', async (req, res) => {
    try {
        const { driver_id, status } = req.body;

        if (!driver_id || !status) {
            return res.status(400).json({ error: 'Driver ID and status are required' });
        }

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Update driver status
        await query(
            'UPDATE drivers SET status = ? WHERE id = ?',
            [status, driver_id]
        );

        // Update associated vehicle status
        await query(
            'UPDATE vehicles SET status = ? WHERE driver_id = ?',
            [status, driver_id]
        );

        res.json({ success: true, message: 'Status updated' });

    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Driver Profile
router.get('/profile/:id', async (req, res) => {
    try {
        const driverId = req.params.id;

        const drivers = await query(
            'SELECT id, name, phone, status FROM drivers WHERE id = ?',
            [driverId]
        );

        if (drivers.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json({ success: true, driver: drivers[0] });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Active Routes
router.get('/routes', async (req, res) => {
    try {
        const routes = await query(
            'SELECT * FROM routes WHERE status = "active" ORDER BY name ASC'
        );
        res.json({ success: true, routes });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Assign Route (Create/Update Vehicle)
router.post('/assign-route', async (req, res) => {
    try {
        const { driver_id, route_id, plate_number } = req.body;

        if (!driver_id || !route_id || !plate_number) {
            return res.status(400).json({ error: 'Driver ID, Route ID, and Plate Number are required' });
        }

        // Check if driver already has a vehicle
        const existingVehicle = await query(
            'SELECT id FROM vehicles WHERE driver_id = ?',
            [driver_id]
        );

        // ... existing query ...
        if (existingVehicle.length > 0) {
            // Update existing vehicle
            await query(
                'UPDATE vehicles SET route_id = ?, plate_number = ? WHERE driver_id = ?',
                [route_id, plate_number, driver_id]
            );
        } else {
            // Create new vehicle
            await query(
                'INSERT INTO vehicles (driver_id, route_id, plate_number, status) VALUES (?, ?, ?, ?)',
                [driver_id, route_id, plate_number, 'inactive']
            );
        }

        // Get updated/created vehicle info
        const updatedVehicle = await query(
            'SELECT v.*, r.name as route_name FROM vehicles v LEFT JOIN routes r ON v.route_id = r.id WHERE v.driver_id = ?',
            [driver_id]
        );

        res.json({
            success: true,
            message: 'Route assigned successfully',
            vehicle: updatedVehicle[0]
        });

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Plate number already exists' });
        }
        console.error('Assign route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
