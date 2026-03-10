import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Fail fast if required env vars are missing
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is missing. Add JWT_SECRET=your_secret to server/.env');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing. Add MONGO_URI=mongodb+... to server/.env');
    process.exit(1);
}

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// Serve uploaded product images (full URL: http://localhost:5000/uploads/xxx)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (no DB) – confirms server and proxy work
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    let message = (err && err.message) ? String(err.message) : 'Something went wrong';
    if (!res.headersSent && (message === 'next is not a function' || message.toLowerCase().includes('next is not a function'))) {
        message = 'Server error. Restart the backend: stop the server (Ctrl+C), then from the server folder run: npm run dev';
    }
    if (!res.headersSent) res.status(500).json({ message });
});

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
