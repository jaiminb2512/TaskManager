import { Router } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateCallback } from '../middlewares/authMiddleware';

const router = Router();

// Protect all task routes
router.use(authenticateCallback);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
