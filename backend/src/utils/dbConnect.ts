import pg, { Pool, PoolClient, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl: string | undefined = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}

const poolConfig: PoolConfig = {
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
};

const pool: Pool = new Pool(poolConfig);

pool.on('error', (err: Error): void => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const connectDB = async (): Promise<boolean> => {
    let client: PoolClient | null = null;
    try {
        client = await pool.connect();
        console.log('Connected to PostgreSQL database successfully');
        return true;
    } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to connect to PostgreSQL database:', errorMessage);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
};

export default pool;
export type { Pool, PoolClient, PoolConfig };

