const { query } = require('../utils/database');

// WebSocket location handler
function setupLocationHandler(io) {
    // Store active connections
    const activeConnections = new Map();

    io.on('connection', (socket) => {
        console.log('🔌 New WebSocket connection:', socket.id);

        // Handle driver location updates
        socket.on('driver:location', async (data) => {
            try {
                const { vehicle_id, latitude, longitude, speed } = data;

                if (!vehicle_id || !latitude || !longitude) {
                    socket.emit('error', { message: 'Invalid location data' });
                    return;
                }

                // Store location in database
                await query(
                    'INSERT INTO locations (vehicle_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)',
                    [vehicle_id, latitude, longitude, speed || 0]
                );

                // Get vehicle and route info
                const vehicles = await query(`
                    SELECT v.id, v.plate_number, v.route_id, r.name as route_name
                    FROM vehicles v
                    LEFT JOIN routes r ON v.route_id = r.id
                    WHERE v.id = ?
                `, [vehicle_id]);

                if (vehicles.length > 0) {
                    const vehicle = vehicles[0];

                    // Broadcast to all passengers
                    io.emit('vehicle:update', {
                        vehicle_id: vehicle.id,
                        plate_number: vehicle.plate_number,
                        route_id: vehicle.route_id,
                        route_name: vehicle.route_name,
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        speed: parseFloat(speed) || 0,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`📍 Location updated for vehicle ${vehicle_id}`);
                }

            } catch (error) {
                console.error('Location update error:', error);
                socket.emit('error', { message: 'Failed to update location' });
            }
        });

        // Handle driver status change
        socket.on('driver:status', async (data) => {
            try {
                const { driver_id, vehicle_id, status } = data;

                if (!driver_id || !status) {
                    socket.emit('error', { message: 'Invalid status data' });
                    return;
                }

                // Update driver status
                await query(
                    'UPDATE drivers SET status = ? WHERE id = ?',
                    [status, driver_id]
                );

                // Update vehicle status
                if (vehicle_id) {
                    await query(
                        'UPDATE vehicles SET status = ? WHERE id = ?',
                        [status, vehicle_id]
                    );

                    // Broadcast status change
                    io.emit('vehicle:status', {
                        vehicle_id,
                        status,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`✅ Driver ${driver_id} status changed to ${status}`);
                }

            } catch (error) {
                console.error('Status update error:', error);
                socket.emit('error', { message: 'Failed to update status' });
            }
        });

        // Handle passenger requesting live vehicles
        socket.on('passenger:request_vehicles', async (data) => {
            try {
                const { route_id } = data || {};

                let sql = `
                    SELECT 
                        v.id as vehicle_id,
                        v.plate_number,
                        v.route_id,
                        r.name as route_name,
                        l.latitude,
                        l.longitude,
                        l.speed,
                        l.timestamp
                    FROM vehicles v
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
                    WHERE v.status = 'active' AND l.latitude IS NOT NULL
                `;

                const params = [];
                if (route_id) {
                    sql += ' AND v.route_id = ?';
                    params.push(route_id);
                }

                const vehicles = await query(sql, params);

                socket.emit('vehicles:list', {
                    vehicles,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Get vehicles error:', error);
                socket.emit('error', { message: 'Failed to get vehicles' });
            }
        });

        // Store connection
        activeConnections.set(socket.id, socket);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected:', socket.id);
            activeConnections.delete(socket.id);
        });
    });

    console.log('✅ WebSocket location handler initialized');
}

module.exports = setupLocationHandler;
