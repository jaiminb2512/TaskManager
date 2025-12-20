import { api } from "../lib/api";
import { z } from "zod";

export const Priority = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT",
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export const Status = {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    REVIEW: "REVIEW",
    COMPLETED: "COMPLETED",
} as const;

export type Status = typeof Status[keyof typeof Status];

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    creatorId: string;
    assignedToId: string;
    createdAt: string;
    updatedAt: string;
    creator?: { name: string; email: string };
    assignedTo?: { name: string; email: string };
}

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().min(1, "Description is required"),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    priority: z.nativeEnum(Priority),
    status: z.nativeEnum(Status).optional(),
    assignedToId: z.string().uuid("Invalid user ID").optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

interface GetTasksParams {
    filter?: "assigned" | "created" | "overdue";
    status?: Status;
    priority?: Priority;
    sortBy?: "dueDate" | "createdAt" | "priority";
    sortOrder?: "asc" | "desc";
}

export const taskService = {
    getAll: async (params?: GetTasksParams): Promise<{ data: Task[] }> => {
        const response = await api.get<{ data: Task[] }>("/tasks", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Task> => {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    create: async (data: CreateTaskFormValues): Promise<Task> => {
        const response = await api.post<Task>("/tasks", data);
        return response.data;
    },

    update: async (id: string, data: UpdateTaskFormValues): Promise<Task> => {
        const response = await api.put<Task>(`/tasks/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },
};
