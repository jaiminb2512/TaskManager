import { Request, Response } from 'express';
import ApiResponseUtil from '../utils/apiResponse';
import notificationService from '../services/notificationService';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return ApiResponseUtil.unauthorized(res, 'User not authenticated');

        const notifications = await notificationService.getUserNotifications(userId);
        return ApiResponseUtil.success(res, notifications, 'Notifications retrieved successfully');
    } catch (error: any) {
        console.error('Get notifications error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to get notifications', error.message);
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) return ApiResponseUtil.unauthorized(res, 'User not authenticated');

        const notification = await notificationService.markAsRead(id, userId);
        if (!notification) {
            return ApiResponseUtil.notFound(res, 'Notification not found');
        }

        return ApiResponseUtil.success(res, notification, 'Notification marked as read');
    } catch (error: any) {
        console.error('Mark notification read error:', error);
        if (error.message === 'Unauthorized access to notification') {
            return ApiResponseUtil.forbidden(res, error.message);
        }
        return ApiResponseUtil.internalError(res, 'Failed to mark notification as read', error.message);
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return ApiResponseUtil.unauthorized(res, 'User not authenticated');

        await notificationService.markAllAsRead(userId);
        return ApiResponseUtil.success(res, null, 'All notifications marked as read');
    } catch (error: any) {
        console.error('Mark all notifications error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to mark notifications as read', error.message);
    }
};
