import prisma from '../utils/prisma';
import { Task, Prisma } from '@prisma/client';

export class TaskRepository {
    async create(data: Prisma.TaskCreateInput): Promise<Task> {
        return prisma.task.create({
            data,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async findMany(where: Prisma.TaskWhereInput, orderBy?: Prisma.TaskOrderByWithRelationInput): Promise<Task[]> {
        return prisma.task.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
            orderBy,
        });
    }

    async findUnique(id: string): Promise<Task | null> {
        return prisma.task.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.task.delete({
            where: { id },
        });
    }
}

export default new TaskRepository();
