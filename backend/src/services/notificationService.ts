import { Notification } from '@prisma/client';
import notificationRepository from '../repositories/notificationRepository';

export class NotificationService {

    async createNotification(userId: string, message: string): Promise<Notification> {
        return notificationRepository.create({
            user: { connect: { id: userId } },
            message,
        });
    }

    async getUserNotifications(userId: string): Promise<Notification[]> {
        return notificationRepository.findByUser(userId);
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
        const notification = await notificationRepository.findById(notificationId);
        if (!notification) return null;
        if (notification.userId !== userId) {
            throw new Error('Unauthorized access to notification');
        }

        return notificationRepository.markAsRead(notificationId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await notificationRepository.markAllAsRead(userId);
    }
}

export default new NotificationService();
