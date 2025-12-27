const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// Create new booking
router.post('/', async (req, res) => {
    try {
        const {
            passenger_name,
            passenger_phone,
            pickup_lat,
            pickup_lng,
            pickup_address,
            dropoff_lat,
            dropoff_lng,
            dropoff_address,
            trip_datetime,
            passengers_count,
            notes,
            distance,
            duration,
            estimated_price
        } = req.body;

        const query = `
            INSERT INTO bookings (
                passenger_name, passenger_phone,
                pickup_lat, pickup_lng, pickup_address,
                dropoff_lat, dropoff_lng, dropoff_address,
                trip_datetime, passengers_count, notes,
                distance, duration, estimated_price,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const result = await db.query(query, [
            passenger_name, passenger_phone,
            pickup_lat, pickup_lng, pickup_address,
            dropoff_lat, dropoff_lng, dropoff_address,
            trip_datetime, passengers_count, notes,
            distance, duration, estimated_price
        ]);

        res.json({
            success: true,
            booking_id: result.insertId,
            message: 'تم إنشاء الحجز بنجاح'
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'فشل إنشاء الحجز'
        });
    }
});

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM bookings';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const bookings = await db.query(query, params);

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'فشل في جلب الحجوزات'
        });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const bookings = await db.query(
            'SELECT * FROM bookings WHERE id = ?',
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'الحجز غير موجود'
            });
        }

        res.json({
            success: true,
            booking: bookings[0]
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            error: 'فشل في جلب الحجز'
        });
    }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Valid statuses: pending, confirmed, assigned, in_progress, completed, cancelled
        const validStatuses = ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'حالة غير صالحة'
            });
        }

        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'تم تحديث حالة الحجز'
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            error: 'فشل في تحديث حالة الحجز'
        });
    }
});

// Assign driver to booking
router.put('/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const { driver_id, vehicle_id } = req.body;

        await db.query(
            'UPDATE bookings SET driver_id = ?, vehicle_id = ?, status = ? WHERE id = ?',
            [driver_id, vehicle_id, 'assigned', id]
        );

        res.json({
            success: true,
            message: 'تم تعيين السائق للحجز'
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({
            success: false,
            error: 'فشل في تعيين السائق'
        });
    }
});

// Delete booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM bookings WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'تم حذف الحجز'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            error: 'فشل في حذف الحجز'
        });
    }
});

module.exports = router;
