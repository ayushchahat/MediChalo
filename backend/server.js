// Load environment variables from the .env file
require('dotenv').config({ path: './.env' });

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const initializeSocket = require('./services/notificationService');

// --- Import All Route Handlers ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

// --- Initial Setup ---
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = initializeSocket(server);
app.set('io', io);

// --- Core Middleware ---

// ✅ Configure CORS properly (for both dev + production)
const allowedOrigins = [
  'http://localhost:3000',                  // Local frontend (dev)
  'https://medichalo-frontend.onrender.com' // Deployed frontend (prod)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Make sure Express can handle JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like uploaded documents and images) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Route Registration ---
app.get('/api', (req, res) => {
  res.send('MediChalo API is running...');
});

// Register all feature-specific routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/delivery', deliveryRoutes);

// --- Global Error Handling ---
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
