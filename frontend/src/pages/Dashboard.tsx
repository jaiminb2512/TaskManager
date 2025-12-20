import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import TaskModal from "../components/TaskModal";
import {
    taskService,
    type Task,
    type CreateTaskFormValues,
    Priority,
    Status,
} from "../services/taskService";
import { socketService } from "../services/socketService";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { clsx } from "clsx";

export default function Dashboard() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
    const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");

    // Connect to socket functionality
    useEffect(() => {
        socketService.connect();

        const handleTaskUpdate = () => {
            console.log("Socket event received: Refreshing tasks");
            // Invalidate queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        };

        socketService.on("task:created", handleTaskUpdate);
        socketService.on("task:updated", handleTaskUpdate);
        socketService.on("task:deleted", handleTaskUpdate);
        socketService.on("notification:assigned", handleTaskUpdate);

        return () => {
            socketService.off("task:created", handleTaskUpdate);
            socketService.off("task:updated", handleTaskUpdate);
            socketService.off("task:deleted", handleTaskUpdate);
            socketService.off("notification:assigned", handleTaskUpdate);
            socketService.disconnect();
        };
    }, [queryClient]);

    // Data Fetching
    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ["tasks", filterStatus, filterPriority],
        queryFn: () =>
            taskService.getAll({
                status: filterStatus !== "ALL" ? filterStatus : undefined,
                priority: filterPriority !== "ALL" ? filterPriority : undefined,
                sortBy: "createdAt",
                sortOrder: "desc",
            }),
    });

    console.log(tasks)

    // Mutations
    const createTaskMutation = useMutation({
        mutationFn: taskService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setIsModalOpen(false);
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateTaskFormValues }) =>
            taskService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setIsModalOpen(false);
            setSelectedTask(undefined);
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: taskService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const handleCreateOrUpdate = async (data: CreateTaskFormValues) => {
        if (selectedTask) {
            await updateTaskMutation.mutateAsync({ id: selectedTask.id, data });
        } else {
            await createTaskMutation.mutateAsync(data);
        }
    };

    const handleEditClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedTask(undefined);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTaskMutation.mutateAsync(id);
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case Priority.URGENT:
                return "text-red-600 bg-red-50 border-red-200";
            case Priority.HIGH:
                return "text-orange-600 bg-orange-50 border-orange-200";
            case Priority.MEDIUM:
                return "text-blue-600 bg-blue-50 border-blue-200";
            case Priority.LOW:
                return "text-green-600 bg-green-50 border-green-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case Status.COMPLETED:
                return "text-green-700 bg-green-100";
            case Status.IN_PROGRESS:
                return "text-blue-700 bg-blue-100";
            case Status.REVIEW:
                return "text-purple-700 bg-purple-100";
            case Status.TODO:
                return "text-slate-700 bg-slate-100";
            default:
                return "text-gray-700 bg-gray-100";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Manage your tasks and track progress.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <select
                                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as Status | "ALL")}
                            >
                                <option value="ALL">All Status</option>
                                {Object.values(Status).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                            <select
                                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value as Priority | "ALL")}
                            >
                                <option value="ALL">All Priorities</option>
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleCreateClick}>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 rounded-lg bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">Failed to load tasks. Please try again.</p>
                    </div>
                ) :
                    (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks?.data?.map((task) => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className={clsx("px-2 py-1 rounded-full text-xs font-medium border", getPriorityColor(task.priority))}>
                                                {task.priority}
                                            </div>
                                            <div className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(task.status))}>
                                                {task.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <CardTitle className="mt-2 line-clamp-1" title={task.title}>
                                            {task.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-500 line-clamp-3 h-16" title={task.description}>
                                            {task.description}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditClick(task)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteClick(task.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {tasks?.data?.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No tasks found. Create one to get started!
                                </div>
                            )}
                        </div>
                    )}

                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateOrUpdate}
                    initialData={selectedTask}
                    title={selectedTask ? "Edit Task" : "Create New Task"}
                />
            </main>
        </div>
    );
}
