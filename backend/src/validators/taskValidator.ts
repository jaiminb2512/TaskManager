import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
    description: z.string().min(1, "Description is required"),
    dueDate: z.string().datetime({ message: "Invalid ISO 8601 date string" }),
    priority: z.nativeEnum(Priority, { message: "Invalid priority" }),
    assignedToId: z.string().uuid("Invalid assignee ID").optional(), // Optional in input, logic handles it
});

export const UpdateTaskSchema = z.object({
    title: z.string().max(100).optional(),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(Status).optional(),
    assignedToId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
