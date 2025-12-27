const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'wasalny.db');
let db;

try {
    db = new Database(dbPath, { verbose: console.log });
    console.log('✅ SQLite database initialized at:', dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Initialize tables
    initializeTables();
} catch (error) {
    console.error('❌ Database initialization error:', error.message);
}

/**
 * Initialize database tables
 */
function initializeTables() {
    try {
        // Admins table
        db.exec(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Drivers table
        db.exec(`
            CREATE TABLE IF NOT EXISTS drivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Routes table
        db.exec(`
            CREATE TABLE IF NOT EXISTS routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                start_point TEXT NOT NULL,
                end_point TEXT NOT NULL,
                start_lat REAL,
                start_lng REAL,
                end_lat REAL,
                end_lng REAL,
                polyline TEXT,
                status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Vehicles table
        db.exec(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plate_number TEXT UNIQUE NOT NULL,
                driver_id INTEGER,
                route_id INTEGER,
                status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
                FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
            )
        `);

        // Locations table (for tracking)
        db.exec(`
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                speed REAL DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            )
        `);

        // Bookings table
        db.exec(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                passenger_name TEXT NOT NULL,
                passenger_phone TEXT NOT NULL,
                pickup_lat REAL NOT NULL,
                pickup_lng REAL NOT NULL,
                pickup_address TEXT,
                dropoff_lat REAL NOT NULL,
                dropoff_lng REAL NOT NULL,
                dropoff_address TEXT,
                trip_datetime DATETIME,
                passengers_count INTEGER DEFAULT 1,
                notes TEXT,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables initialized');

        // Create default admin if not exists
        createDefaultAdmin();

    } catch (error) {
        console.error('❌ Table initialization error:', error.message);
    }
}

/**
 * Create default admin account
 */
function createDefaultAdmin() {
    try {
        const bcrypt = require('bcrypt');
        const adminEmail = 'admin@wasalny.com';

        // Check if admin exists
        const stmt = db.prepare('SELECT id FROM admins WHERE email = ?');
        const existing = stmt.get(adminEmail);

        if (!existing) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            const insert = db.prepare('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)');
            insert.run('Admin', adminEmail, hashedPassword);
            console.log('✅ Default admin created (admin@wasalny.com / admin123)');
        }
    } catch (error) {
        console.error('❌ Default admin creation error:', error.message);
    }
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        if (!db) return false;
        const stmt = db.prepare('SELECT 1 as test');
        const result = stmt.get();
        console.log('✅ Database connected successfully');
        return result.test === 1;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}

/**
 * Execute SQL query (compatibility wrapper)
 * Supports both array and object results
 */
function query(sql, params = []) {
    try {
        if (!db) throw new Error('Database not initialized');

        const sqlLower = sql.toLowerCase().trim();

        // Handle SELECT queries
        if (sqlLower.startsWith('select')) {
            const stmt = db.prepare(sql);
            const results = stmt.all(...params);
            return results;
        }

        // Handle INSERT queries
        if (sqlLower.startsWith('insert')) {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return { insertId: result.lastInsertRowid, affectedRows: result.changes };
        }

        // Handle UPDATE queries
        if (sqlLower.startsWith('update')) {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return { affectedRows: result.changes };
        }

        // Handle DELETE queries
        if (sqlLower.startsWith('delete')) {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return { affectedRows: result.changes };
        }

        throw new Error('Unsupported SQL query type');
    } catch (error) {
        console.error('❌ Query error:', error.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw error;
    }
}

/**
 * Execute raw SQL (for complex queries)
 */
function execute(sql) {
    try {
        if (!db) throw new Error('Database not initialized');
        return db.exec(sql);
    } catch (error) {
        console.error('❌ Execute error:', error.message);
        throw error;
    }
}

/**
 * Get database instance
 */
function getDatabase() {
    return db;
}

module.exports = {
    db,
    query,
    execute,
    getDatabase,
    testConnection
};
