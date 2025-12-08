const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow requests from the Vite dev server
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging removed for clean terminal

// Initialize Database Tables
const initDB = async () => {
    try {
        // SCORCHED EARTH: DROP TABLE TO ENSURE SCHEMA IS CORRECT
        // In production, we would use migrations, but for this dev issue, we need to guarantee the schema.
        await pool.query(`DROP TABLE IF EXISTS banned_ips`);

        await pool.query(`
            CREATE TABLE banned_ips (
                ip_address VARCHAR(45) PRIMARY KEY,
                banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                banned_by VARCHAR(255)
            )
        `);
        console.log('[DB] Banned IPs table recreated with correct schema');
    } catch (err) {
        console.error('[DB] Table initialization error:', err);
    }
};
initDB();



// JWT Secret (in production, use a strong secret in .env)
const JWT_SECRET = process.env.JWT_SECRET || '123456789abcdef';

// ROUTES 

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

//SIGN UP 
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, email, role, created_at',
            [name, email, hashedPassword, role || 'analyst']
        );

        const user = newUser.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user.user_id,
                    name: user.full_name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup',
            error: error.message
        });
    }
});

//SIGN IN
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.user_id,
                    name: user.full_name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signin',
            error: error.message
        });
    }
});

//MIDDLEWARE: Verify JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

//PROTECTED ROUTE EXAMPLE
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            data: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                role: user.role,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

//INGESTION ROUTE 
app.post('/api/ingest', async (req, res) => {
    try {
        const { source_ip, attack_type, severity } = req.body;

        // Check if IP is banned
        const bannedCheck = await pool.query("SELECT * FROM banned_ips WHERE ip_address = $1", [source_ip]);
        if (bannedCheck.rows.length > 0) {
            console.log(`[BLOCKED] Attack from banned IP: ${source_ip}`);
            // Return 200 to confuse the attacker, or 403 to notify them. 
            // Returning 403 Forbidden is standard.
            return res.status(403).json({ message: "Connection refused by security policy" });
        }

        const newLog = await pool.query(
            "INSERT INTO attack_logs (source_ip, attack_type, severity) VALUES ($1, $2, $3) RETURNING *",
            [source_ip, attack_type, severity]
        );
        res.json(newLog.rows[0]);
    } catch (err) {
        console.error("Ingest Error:", err.message);
        res.status(500).send("Server Error");
    }
});

// DASHBOARD ROUTE 
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await pool.query("SELECT * FROM attack_logs ORDER BY log_id DESC");
        res.json(logs.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).send("Server Error");
    }
});

// UPDATE LOG STATUS ROUTE
app.put('/api/logs/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Open', 'In Progress', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: Open, In Progress, or Resolved'
            });
        }

        const result = await pool.query(
            "UPDATE attack_logs SET status = $1 WHERE log_id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Log not found'
            });
        }

        res.json({
            success: true,
            message: 'Log status updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// ADMIN: PURGE ALL LOGS
app.delete('/api/admin/purge', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Admin privileges required'
            });
        }

        // Delete all logs
        await pool.query("TRUNCATE TABLE attack_logs RESTART IDENTITY");

        res.json({
            success: true,
            message: 'All logs purged successfully'
        });

    } catch (err) {
        console.error("Purge Error:", err.message);
        res.status(500).json({
            success: false,
            message: 'Server error during purge',
            error: err.message
        });
    }
});

// ADMIN: BAN IP
app.post('/api/admin/ban', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Admin privileges required'
            });
        }

        const { ip_address } = req.body;
        console.log(`[BAN] Request to ban IP: ${ip_address} by ${req.user.email}`);

        if (!ip_address) {
            return res.status(400).json({
                success: false,
                message: 'IP address is required'
            });
        }

        await pool.query(
            "INSERT INTO banned_ips (ip_address, banned_by) VALUES ($1, $2) ON CONFLICT (ip_address) DO NOTHING",
            [ip_address, req.user.email]
        );

        res.json({
            success: true,
            message: `IP ${ip_address} has been banned successfully.`
        });

    } catch (err) {
        console.error("Ban Error:", err.message);
        res.status(500).json({
            success: false,
            message: 'Server error during ban',
            error: err.message
        });
    }
});

// START SERVER 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}`);

});