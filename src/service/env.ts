import dotenv from 'dotenv'

dotenv.config()

function getEnv(key: string, fallback?: string): string {
    const value = process.env[key];
    if (value === undefined) {
        if (fallback !== undefined) return fallback;
        throw new Error(`Missing required env variable: ${key}`);
    }
    return value;
}


export const Env = {
    port: Number(getEnv('PORT', "7001")),
    gPort: Number(getEnv('GRPC_HOST', "localhost:7030")),
    frontendUrl: getEnv('FRONTEND_URL', "http://localhost:7010"),
    mode: getEnv('MODE', "dev"),
    tickRate: Number(getEnv("TICK_RATE", "60")),
    storagePath: getEnv("STORAGE_PATH", "storage"),
    worldsPath: getEnv("WORLDS_PATH", "worlds"),
}