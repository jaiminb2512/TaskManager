import { Request, Response } from 'express';
import ApiResponseUtil from '../utils/apiResponse';
import taskService from '../services/taskService';
import { CreateTaskSchema, UpdateTaskSchema } from '../validators/taskValidator';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

import { getIO } from '../utils/socket';

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return ApiResponseUtil.unauthorized(res, 'User not authenticated');

        // Zod Validation
        const validation = CreateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map(e => e.message).join(', ');
            return ApiResponseUtil.validationError(res, errorMessages);
        }

        const task = await taskService.createTask(userId, validation.data);

        // Emit socket event
        try {
            const io = getIO();
            io.emit('task:created', task);

            // If assigned to someone else, notify them personally (optional for basic req but good for "Assignment Notification")
            if (task.assignedToId && task.assignedToId !== userId) {
                // In a real app, we might emit to a specific user room like `user:${task.assignedToId}`
                io.emit('notification:assigned', {
                    userId: task.assignedToId,
                    taskId: task.id,
                    message: `You have been assigned a new task: ${task.title}`
                });
            }

        } catch (socketError) {
            console.error('Socket emit error:', socketError);
        }

        return ApiResponseUtil.created(res, task, 'Task created successfully');
    } catch (error: any) {
        console.error('Create task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to create task', error.message);
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return ApiResponseUtil.unauthorized(res, 'User not authenticated');

        const tasks = await taskService.getTasks(userId, req.query);
        return ApiResponseUtil.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error: any) {
        console.error('Get tasks error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to retrieve tasks', error.message);
    }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const task = await taskService.getTaskById(id);

        if (!task) {
            return ApiResponseUtil.notFound(res, 'Task not found');
        }

        return ApiResponseUtil.success(res, task, 'Task retrieved successfully');
    } catch (error: any) {
        console.error('Get task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to retrieve task', error.message);
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check existence first
        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return ApiResponseUtil.notFound(res, 'Task not found');
        }

        // Zod Validation
        const validation = UpdateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map(e => e.message).join(', ');
            return ApiResponseUtil.validationError(res, errorMessages);
        }

        const task = await taskService.updateTask(id, validation.data);

        // Emit socket event
        try {
            const io = getIO();
            io.emit('task:updated', task);

            // If reassigned, notify the new assignee
            if (validation.data.assignedToId && validation.data.assignedToId !== req.user?.userId) {
                io.emit('notification:assigned', {
                    userId: validation.data.assignedToId,
                    taskId: task?.id,
                    message: `You have been assigned a task: ${task?.title}`
                });
            }
        } catch (socketError) {
            console.error('Socket emit error:', socketError);
        }

        return ApiResponseUtil.success(res, task, 'Task updated successfully');
    } catch (error: any) {
        console.error('Update task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to update task', error.message);
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const existingTask = await taskService.getTaskById(id);
        if (!existingTask) {
            return ApiResponseUtil.notFound(res, 'Task not found');
        }

        if (existingTask.creatorId !== userId) {
            return ApiResponseUtil.forbidden(res, 'Only the creator can delete the task');
        }

        await taskService.deleteTask(id);

        // Emit socket event
        try {
            const io = getIO();
            io.emit('task:deleted', { id });
        } catch (socketError) {
            console.error('Socket emit error:', socketError);
        }

        return ApiResponseUtil.success(res, null, 'Task deleted successfully');
    } catch (error: any) {
        console.error('Delete task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to delete task', error.message);
    }
};
