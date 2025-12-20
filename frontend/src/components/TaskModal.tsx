import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    createTaskSchema,
    type CreateTaskFormValues,
    Priority,
    Status,
    type Task,
} from "../services/taskService";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskFormValues) => Promise<void>;
    initialData?: Task;
    title: string;
}

export default function TaskModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
}: TaskModalProps) {
    const isEdit = !!initialData;
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateTaskFormValues>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: Priority.MEDIUM,
            status: Status.TODO,
            dueDate: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData ? {
                ...initialData,
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
            } : {
                title: "",
                description: "",
                priority: Priority.MEDIUM,
                status: Status.TODO,
                dueDate: new Date().toISOString().split("T")[0],
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Task title"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            rows={3}
                            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                            placeholder="Detailed description..."
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                {...register("priority")}
                            >
                                {Object.values(Priority).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                            {errors.priority && (
                                <p className="text-xs text-red-500">
                                    {errors.priority.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                {...register("status")}
                            >
                                {Object.values(Status).map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="text-xs text-red-500">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            {...register("dueDate")}
                        />
                        {errors.dueDate && (
                            <p className="text-xs text-red-500">{errors.dueDate.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {isEdit ? "Update Task" : "Create Task"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
