require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sql = require('./src/config/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173', // Frontend URL
  credentials: true // Allow cookies
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline often needed for dev/React
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.VITE_API_URL || 'http://localhost:5173'],
    },
  },
  frameguard: {
    action: "deny", // Prevents Clickjacking by setting X-Frame-Options to DENY
  },
  xssFilter: true, // Enables X-XSS-Protection header
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // Verify connection to Supabase by running a simple query
    const result = await sql`SELECT NOW()`;
    
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: result[0].now
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
