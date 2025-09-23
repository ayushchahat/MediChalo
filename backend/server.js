// Load environment variables from the .env file
require('dotenv').config({ path: './.env' });

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path'); // Corrected this line
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
// Connect to the MongoDB database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = initializeSocket(server);
app.set('io', io); // Make 'io' accessible in other parts of the app (like controllers)

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for your frontend
app.use(express.json()); // Allow the server to accept and parse JSON in request bodies
app.use(express.urlencoded({ extended: true })); // Allow parsing of URL-encoded data

// Serve static files (like uploaded documents and images) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Route Registration ---
// A simple health-check route to confirm the API is running
app.get('/api', (req, res) => {
    res.send('MediChalo API is running...');
});

// Register all the feature-specific routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/delivery', deliveryRoutes);

// --- Global Error Handling ---
// This middleware will catch any errors that occur in the routes above
app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err.stack);
    res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

