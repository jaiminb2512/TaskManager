import { api } from "../lib/api";
import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long." }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface SignUpPayload {
    name: string;
    email: string;
    password: string;
}

export const authService = {
    signIn: async (data: SignInFormValues): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/signin", data);
        return response.data;
    },

    signUp: async (data: SignUpPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/signup", data);
        return response.data;
    },
};
