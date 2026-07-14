import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
    out: './.drizzle', 
    schema: [
        './src/modules/*/infrastructure/drizzle/schema.ts',
        './src/infrastructure/drizzle/schema.ts'
    ],
    dialect: 'postgresql',
    schemaFilter: [
        'analytics',
        'catalog',
        'inventory',
        'outbox',
        'procurement',
        'sales',
        'system',
    ],
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
