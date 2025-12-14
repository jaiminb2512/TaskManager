import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './utils/dbConnect';
import ApiResponseUtil from './utils/apiResponse';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
