import { Task, Status, Priority } from '@prisma/client';
import taskRepository from '../repositories/taskRepository';
import { CreateTaskInput, UpdateTaskInput } from '../validators/taskValidator';

export class TaskService {
    async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
        // Business Logic: If assignedToId is not provided, assign to creator
        const assignedToId = input.assignedToId || userId;

        return taskRepository.create({
            title: input.title,
            description: input.description,
            dueDate: new Date(input.dueDate),
            priority: input.priority,
            creator: { connect: { id: userId } },
            assignedTo: { connect: { id: assignedToId } },
        });
    }

    async getTasks(userId: string, filters: any): Promise<Task[]> {
        const { filter, status, priority, sortBy, sortOrder } = filters;
        let whereClause: any = {};

        if (filter === 'assigned') {
            whereClause.assignedToId = userId;
        } else if (filter === 'created') {
            whereClause.creatorId = userId;
        } else if (filter === 'overdue') {
            whereClause.dueDate = { lt: new Date() };
            whereClause.status = { not: Status.COMPLETED };
            whereClause.assignedToId = userId;
        } else {
            whereClause.OR = [
                { creatorId: userId },
                { assignedToId: userId }
            ];
        }

        if (status && Object.values(Status).includes(status)) {
            whereClause.status = status;
        }

        if (priority && Object.values(Priority).includes(priority)) {
            whereClause.priority = priority;
        }

        const orderBy = sortBy ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' } : undefined;

        return taskRepository.findMany(whereClause, orderBy);
    }

    async getTaskById(taskId: string): Promise<Task | null> {
        return taskRepository.findUnique(taskId);
    }

    async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task | null> {
        // Note: Permission check should happen in Controller or a Middleware, 
        // but simple existence check can pass through.

        // Convert date string to Date object if present
        const updateData: any = { ...updates };
        if (updates.dueDate) {
            updateData.dueDate = new Date(updates.dueDate);
        }

        return taskRepository.update(taskId, updateData);
    }

    async deleteTask(taskId: string): Promise<void> {
        return taskRepository.delete(taskId);
    }
}

export default new TaskService();
