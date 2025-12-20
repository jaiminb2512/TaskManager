import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiResponseUtil from '../utils/apiResponse';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authenticateCallback = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        ApiResponseUtil.unauthorized(res, 'No token provided');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; email: string };
        req.user = decoded;
        next();
    } catch (error) {
        ApiResponseUtil.unauthorized(res, 'Invalid token');
        return;
    }
};
