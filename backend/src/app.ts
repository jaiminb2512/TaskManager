import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './utils/dbConnect';
import ApiResponseUtil from './utils/apiResponse';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import notificationRoutes from './routes/notificationRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',').map(url => url.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // allow requests with no origin (like Postman)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // 🔴 REQUIRED for cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

import { createServer } from 'http';
import { initSocket } from './utils/socket';

const startServer = async () => {
    const connection = await connectDB();
    if (!connection) {
        console.error('Failed to connect to database');
        process.exit(1);
    }

    const httpServer = createServer(app);

    // Initialize Socket.io
    initSocket(httpServer, allowedOrigins);

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

app.get('/', (req, res) => {
    return ApiResponseUtil.success(res, 'server is running...');
});

startServer();

export { app };
