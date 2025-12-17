import prisma from '../utils/prisma';
import { Notification, Prisma } from '@prisma/client';

export class NotificationRepository {
    async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
        return prisma.notification.create({
            data,
        });
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    // Helper to find a specific notification to check ownership
    async findById(id: string): Promise<Notification | null> {
        return prisma.notification.findUnique({
            where: { id },
        });
    }
}

export default new NotificationRepository();
