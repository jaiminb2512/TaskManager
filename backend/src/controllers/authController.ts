import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import ApiResponseUtil from '../utils/apiResponse';

interface SignUpRequest {
    email: string;
    password: string;
}

export const signUp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password }: SignUpRequest = req.body;

        if (!email || !password) {
            return ApiResponseUtil.validationError(
                res,
                'Email and password are required'
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return ApiResponseUtil.validationError(
                res,
                'Invalid email format'
            );
        }

        if (password.length < 6) {
            return ApiResponseUtil.validationError(
                res,
                'Password must be at least 6 characters long'
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return ApiResponseUtil.validationError(
                res,
                'User with this email already exists'
            );
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return ApiResponseUtil.created(
            res,
            {
                user: newUser,
            },
            'User created successfully'
        );
    } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Sign up error:', errorMessage);

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return ApiResponseUtil.validationError(
                res,
                'User with this email already exists'
            );
        }

        return ApiResponseUtil.internalError(
            res,
            'An error occurred during sign up',
            errorMessage
        );
    }
};

