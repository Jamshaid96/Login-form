require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');  // MySQL connection
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Test DB connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(" Connected to MySQL database");
    connection.release();
  } catch (error) {
    console.error(" Database connection failed:", error);
  }
})();

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
