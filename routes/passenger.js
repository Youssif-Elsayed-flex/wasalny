const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');
const { findNearestVehicle } = require('../utils/eta');

// Get all live vehicles with their latest locations
router.get('/vehicles/live', async (req, res) => {
    try {
        const sql = `
            SELECT 
                v.id as vehicle_id,
                v.plate_number,
                v.status as vehicle_status,
                v.route_id,
                r.name as route_name,
                r.start_point,
                r.end_point,
                d.name as driver_name,
                l.latitude,
                l.longitude,
                l.speed,
                l.timestamp
            FROM vehicles v
            LEFT JOIN drivers d ON v.driver_id = d.id
            LEFT JOIN routes r ON v.route_id = r.id
            LEFT JOIN (
                SELECT vehicle_id, latitude, longitude, speed, timestamp
                FROM locations l1
                WHERE timestamp = (
                    SELECT MAX(timestamp)
                    FROM locations l2
                    WHERE l2.vehicle_id = l1.vehicle_id
                )
            ) l ON v.id = l.vehicle_id
            WHERE v.status = 'active'
            AND l.latitude IS NOT NULL
        `;

        const vehicles = await query(sql);

        res.json({
            success: true,
            count: vehicles.length,
            vehicles: vehicles
        });

    } catch (error) {
        console.error('Get live vehicles error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all routes
router.get('/routes', async (req, res) => {
    try {
        const routes = await query(
            'SELECT * FROM routes WHERE status = "active" ORDER BY name'
        );

        res.json({
            success: true,
            count: routes.length,
            routes: routes
        });

    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get vehicles on a specific route
router.get('/routes/:id/vehicles', async (req, res) => {
    try {
        const routeId = req.params.id;

        const sql = `
            SELECT 
                v.id as vehicle_id,
                v.plate_number,
                v.status as vehicle_status,
                d.name as driver_name,
                l.latitude,
                l.longitude,
                l.speed,
                l.timestamp
            FROM vehicles v
            LEFT JOIN drivers d ON v.driver_id = d.id
            LEFT JOIN (
                SELECT vehicle_id, latitude, longitude, speed, timestamp
                FROM locations l1
                WHERE timestamp = (
                    SELECT MAX(timestamp)
                    FROM locations l2
                    WHERE l2.vehicle_id = l1.vehicle_id
                )
            ) l ON v.id = l.vehicle_id
            WHERE v.route_id = ? AND v.status = 'active'
            AND l.latitude IS NOT NULL
        `;

        const vehicles = await query(sql, [routeId]);

        res.json({
            success: true,
            count: vehicles.length,
            vehicles: vehicles
        });

    } catch (error) {
        console.error('Get route vehicles error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Find nearest vehicle to user location
router.post('/vehicles/nearest', async (req, res) => {
    try {
        const { latitude, longitude, route_id } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Get all active vehicles (optionally filtered by route)
        let sql = `
            SELECT 
                v.id as vehicle_id,
                v.plate_number,
                v.route_id,
                r.name as route_name,
                l.latitude,
                l.longitude,
                l.speed
            FROM vehicles v
            LEFT JOIN routes r ON v.route_id = r.id
            LEFT JOIN (
                SELECT vehicle_id, latitude, longitude, speed
                FROM locations l1
                WHERE timestamp = (
                    SELECT MAX(timestamp)
                    FROM locations l2
                    WHERE l2.vehicle_id = l1.vehicle_id
                )
            ) l ON v.id = l.vehicle_id
            WHERE v.status = 'active' AND l.latitude IS NOT NULL
        `;

        const params = [];
        if (route_id) {
            sql += ' AND v.route_id = ?';
            params.push(route_id);
        }

        const vehicles = await query(sql, params);

        const nearest = findNearestVehicle(latitude, longitude, vehicles);

        res.json({
            success: true,
            nearest: nearest
        });

    } catch (error) {
        console.error('Find nearest vehicle error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
