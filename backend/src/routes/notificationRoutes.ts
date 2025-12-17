import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateCallback } from '../middlewares/authMiddleware';

const router = Router();

// Protect all notification routes
router.use(authenticateCallback);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
