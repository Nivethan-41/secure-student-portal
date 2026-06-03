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

app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.VITE_API_URL || 'http://localhost:5173'],
    },
  },
  frameguard: {
    action: "deny",
  },
  xssFilter: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Secure Student Portal API is running!');
});

app.get('/health', async (req, res) => {
  try {
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
