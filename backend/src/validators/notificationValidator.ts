import { z } from 'zod';

export const CreateNotificationSchema = z.object({
    userId: z.string().uuid(),
    message: z.string().min(1),
});

export const MarkNotificationReadSchema = z.object({
    isRead: z.boolean(),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;
