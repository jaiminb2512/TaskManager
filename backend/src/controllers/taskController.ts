import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import ApiResponseUtil from '../utils/apiResponse';
import { Priority, Status } from '@prisma/client';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

interface CreateTaskDto {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    assignedToId?: string;
}

interface UpdateTaskDto {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: Priority;
    status?: Status;
    assignedToId?: string;
}

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, dueDate, priority }: CreateTaskDto = req.body;
        const userId = req.user?.userId;
        let assignedToId = req.body?.assignedToId;

        if (!userId) {
            return ApiResponseUtil.unauthorized(res, 'User not authenticated');
        }

        if (!title || !description || !dueDate || !priority) {
            return ApiResponseUtil.validationError(res, 'Missing required fields');
        }

        if (!assignedToId) {
            assignedToId = userId;
        }

        if (title.length > 100) {
            return ApiResponseUtil.validationError(res, 'Title must be 100 characters or less');
        }

        // Validate Enums
        if (!Object.values(Priority).includes(priority)) {
            return ApiResponseUtil.validationError(res, 'Invalid priority value');
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDate),
                priority,
                creatorId: userId,
                assignedToId: assignedToId,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });

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
        if (!userId) {
            return ApiResponseUtil.unauthorized(res, 'User not authenticated');
        }

        const { filter, status, priority, sortBy, sortOrder } = req.query;

        let whereClause: any = {};

        // Filtering based on dashboard requirements or general list
        if (filter === 'assigned') {
            whereClause.assignedToId = userId;
        } else if (filter === 'created') {
            whereClause.creatorId = userId;
        } else if (filter === 'overdue') {
            whereClause.dueDate = {
                lt: new Date(),
            };
            whereClause.status = {
                not: Status.COMPLETED, // usually overdue implies not done
            };
            // You might want to see overdue tasks relevant to you?
            // Assuming "Personal Views", so maybe my assigned tasks that are overdue
            whereClause.assignedToId = userId;
        } else {
            // Default: maybe show all tasks I'm involved in? 
            // Or just all tasks if public? "Real-time Collaboration" implies shared, but lists usually need scoping.
            // Let's assume generic "Get All" returns tasks I have access to. 
            // Logic: user can view tasks they created or are assigned to.
            whereClause.OR = [
                { creatorId: userId },
                { assignedToId: userId }
            ];
        }

        if (status && Object.values(Status).includes(status as Status)) {
            whereClause.status = status as Status;
        }

        if (priority && Object.values(Priority).includes(priority as Priority)) {
            whereClause.priority = priority as Priority;
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
            orderBy: {
                dueDate: (sortBy === 'dueDate' && sortOrder === 'desc') ? 'desc' : 'asc',
            },
        });

        return ApiResponseUtil.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error: any) {
        console.error('Get tasks error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to retrieve tasks', error.message);
    }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });

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
        const updates: UpdateTaskDto = req.body;

        // Basic exist check
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) {
            return ApiResponseUtil.notFound(res, 'Task not found');
        }

        // Ideally check permissions (creator or assignee or admin)
        // For now, allow any authenticated user to update? 
        // "Real-time Collaboration" often allows open edit or strict rules.
        // Let's stick to open edit for team members for simplicity unless specified otherwise.

        if (updates.priority && !Object.values(Priority).includes(updates.priority)) {
            return ApiResponseUtil.validationError(res, 'Invalid priority');
        }
        if (updates.status && !Object.values(Status).includes(updates.status)) {
            return ApiResponseUtil.validationError(res, 'Invalid status');
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...updates,
                dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });

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

        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) {
            return ApiResponseUtil.notFound(res, 'Task not found');
        }

        if (existingTask.creatorId !== userId) {
            return ApiResponseUtil.forbidden(res, 'Only the creator can delete the task');
        }

        await prisma.task.delete({ where: { id } });

        // TODO: Emit socket event here

        return ApiResponseUtil.success(res, null, 'Task deleted successfully');
    } catch (error: any) {
        console.error('Delete task error:', error);
        return ApiResponseUtil.internalError(res, 'Failed to delete task', error.message);
    }
};
