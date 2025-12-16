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

        // TODO: Emit socket event here

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

        // TODO: Emit socket event here

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

        // TODO: Emit socket event here

        return ApiResponseUtil.success(res, null, 'Task deleted successfully');
    } catch (error: any) {
        console.error('Delete task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to delete task', error.message);
    }
};
