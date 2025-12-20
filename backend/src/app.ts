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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

const startServer = async () => {
    const connection = await connectDB();
    if (!connection) {
        console.error('Failed to connect to database');
        process.exit(1);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

app.get('/', (req, res) => {
    return ApiResponseUtil.success(res, 'server is running...');
});

startServer();

export { app };
