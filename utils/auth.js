const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const SALT_ROUNDS = 10;

// Generate JWT token
function generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

// Middleware for admin authentication
function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    authenticateAdmin
};
