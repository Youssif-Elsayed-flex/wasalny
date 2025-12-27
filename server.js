const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./utils/database');
const setupLocationHandler = require('./websocket/locationHandler');

// Import routes
const driverRoutes = require('./routes/driver');
const passengerRoutes = require('./routes/passenger');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/booking');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// API Routes
app.use('/api/driver', driverRoutes);
app.use('/api', passengerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Wasalny API on Vercel',
        version: '1.0.0'
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'OK',
        database: dbConnected ? 'Connected (Firebase)' : 'Disconnected (Firebase)',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize Socket.IO if not running in a serverless environment
// Note: Vercel serverless functions don't support persistent WebSockets.
// For production, consider a separate WebSocket provider (like Ably or Pusher) 
// or a dedicated server for the tracking portion.
let server;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    server = http.createServer(app);
    const io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    setupLocationHandler(io);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`\n🚀 Local Server: http://localhost:${PORT}`);
    });
}

module.exports = app;
