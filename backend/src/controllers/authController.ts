import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import ApiResponseUtil from '../utils/apiResponse';

interface SignUpRequest {
    email: string;
    password: string;
    name: string;
}

interface SignInRequest {
    email: string;
    password: string;
}

export const signUp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password, name }: SignUpRequest = req.body;

        if (!email || !password || !name) {
            return ApiResponseUtil.validationError(
                res,
                'Email, password, and name are required'
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
                name: name,
            },
            select: {
                id: true,
                name: true,
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

export const signIn = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password }: SignInRequest = req.body;

        if (!email || !password) {
            return ApiResponseUtil.validationError(
                res,
                'Email and password are required'
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            return ApiResponseUtil.unauthorized(
                res,
                'Invalid email or password'
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return ApiResponseUtil.unauthorized(
                res,
                'Invalid email or password'
            );
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return ApiResponseUtil.success(
            res,
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            },
            'Sign in successful'
        );
    } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Sign in error:', errorMessage);

        return ApiResponseUtil.internalError(
            res,
            'An error occurred during sign in',
            errorMessage
        );
    }
};

