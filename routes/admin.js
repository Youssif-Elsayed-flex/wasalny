const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');
const { generateToken, comparePassword, hashPassword, authenticateAdmin } = require('../utils/auth');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admins = await query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];

        // Verify password
        const isValid = await comparePassword(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({
            id: admin.id,
            role: 'admin',
            email: admin.email
        });

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ====================
// DRIVERS CRUD
// ====================

// Get all drivers
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await query(
            'SELECT id, name, phone, status, created_at FROM drivers ORDER BY created_at DESC'
        );
        res.json({ success: true, drivers });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create driver
router.post('/drivers', async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Name, phone, and password are required' });
        }

        const hashedPassword = await hashPassword(password);

        const result = await query(
            'INSERT INTO drivers (name, phone, password) VALUES (?, ?, ?)',
            [name, phone, hashedPassword]
        );

        res.json({
            success: true,
            message: 'Driver created',
            driver_id: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Phone number already exists' });
        }
        console.error('Create driver error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update driver
router.put('/drivers/:id', async (req, res) => {
    try {
        const driverId = req.params.id;
        const { name, phone, status } = req.body;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(driverId);

        await query(
            `UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'Driver updated' });

    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete driver
router.delete('/drivers/:id', async (req, res) => {
    try {
        const driverId = req.params.id;

        await query('DELETE FROM drivers WHERE id = ?', [driverId]);

        res.json({ success: true, message: 'Driver deleted' });

    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ====================
// VEHICLES CRUD
// ====================

// Get all vehicles
router.get('/vehicles', async (req, res) => {
    try {
        const sql = `
            SELECT v.*, d.name as driver_name, r.name as route_name
            FROM vehicles v
            LEFT JOIN drivers d ON v.driver_id = d.id
            LEFT JOIN routes r ON v.route_id = r.id
            ORDER BY v.created_at DESC
        `;
        const vehicles = await query(sql);
        res.json({ success: true, vehicles });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create vehicle
router.post('/vehicles', async (req, res) => {
    try {
        const { plate_number, driver_id, route_id } = req.body;

        if (!plate_number) {
            return res.status(400).json({ error: 'Plate number is required' });
        }

        const result = await query(
            'INSERT INTO vehicles (plate_number, driver_id, route_id) VALUES (?, ?, ?)',
            [plate_number, driver_id || null, route_id || null]
        );

        res.json({
            success: true,
            message: 'Vehicle created',
            vehicle_id: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Plate number already exists' });
        }
        console.error('Create vehicle error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update vehicle
router.put('/vehicles/:id', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const { plate_number, driver_id, route_id, status } = req.body;

        const updates = [];
        const values = [];

        if (plate_number) {
            updates.push('plate_number = ?');
            values.push(plate_number);
        }
        if (driver_id !== undefined) {
            updates.push('driver_id = ?');
            values.push(driver_id);
        }
        if (route_id !== undefined) {
            updates.push('route_id = ?');
            values.push(route_id);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(vehicleId);

        await query(
            `UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'Vehicle updated' });

    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete vehicle
router.delete('/vehicles/:id', async (req, res) => {
    try {
        const vehicleId = req.params.id;

        await query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

        res.json({ success: true, message: 'Vehicle deleted' });

    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ====================
// ROUTES CRUD
// ====================

// Get all routes
router.get('/routes', async (req, res) => {
    try {
        const routes = await query(
            'SELECT * FROM routes ORDER BY created_at DESC'
        );
        res.json({ success: true, routes });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create route
router.post('/routes', async (req, res) => {
    try {
        const { name, start_point, end_point, start_lat, start_lng, end_lat, end_lng, polyline } = req.body;

        if (!name || !start_point || !end_point) {
            return res.status(400).json({ error: 'Name, start point, and end point are required' });
        }

        const result = await query(
            'INSERT INTO routes (name, start_point, end_point, start_lat, start_lng, end_lat, end_lng, polyline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, start_point, end_point, start_lat || null, start_lng || null, end_lat || null, end_lng || null, polyline || null]
        );

        res.json({
            success: true,
            message: 'Route created',
            route_id: result.insertId
        });

    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update route
router.put('/routes/:id', async (req, res) => {
    try {
        const routeId = req.params.id;
        const { name, start_point, end_point, start_lat, start_lng, end_lat, end_lng, polyline, status } = req.body;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (start_point) {
            updates.push('start_point = ?');
            values.push(start_point);
        }
        if (end_point) {
            updates.push('end_point = ?');
            values.push(end_point);
        }
        if (start_lat !== undefined) {
            updates.push('start_lat = ?');
            values.push(start_lat);
        }
        if (start_lng !== undefined) {
            updates.push('start_lng = ?');
            values.push(start_lng);
        }
        if (end_lat !== undefined) {
            updates.push('end_lat = ?');
            values.push(end_lat);
        }
        if (end_lng !== undefined) {
            updates.push('end_lng = ?');
            values.push(end_lng);
        }
        if (polyline !== undefined) {
            updates.push('polyline = ?');
            values.push(polyline);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(routeId);

        await query(
            `UPDATE routes SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'Route updated' });

    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete route
router.delete('/routes/:id', async (req, res) => {
    try {
        const routeId = req.params.id;

        await query('DELETE FROM routes WHERE id = ?', [routeId]);

        res.json({ success: true, message: 'Route deleted' });

    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ====================
// STATISTICS
// ====================

router.get('/statistics', async (req, res) => {
    try {
        const activeVehicles = await query(
            'SELECT COUNT(*) as count FROM vehicles WHERE status = "active"'
        );

        const totalDrivers = await query(
            'SELECT COUNT(*) as count FROM drivers'
        );

        const totalRoutes = await query(
            'SELECT COUNT(*) as count FROM routes WHERE status = "active"'
        );

        const activeDrivers = await query(
            'SELECT COUNT(*) as count FROM drivers WHERE status = "active"'
        );

        res.json({
            success: true,
            statistics: {
                active_vehicles: activeVehicles[0].count,
                total_drivers: totalDrivers[0].count,
                active_drivers: activeDrivers[0].count,
                total_routes: totalRoutes[0].count
            }
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
