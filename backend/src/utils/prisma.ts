import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pool from './dbConnect';

declare global {
    var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg(pool);

const prisma: PrismaClient = global.prisma || new PrismaClient({
    adapter: adapter,
    log: ['error', 'warn'],
});

if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

export default prisma;
