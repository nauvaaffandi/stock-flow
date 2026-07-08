import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
    out: './internal/.drizzle', 
    schema: [
        './src/modules/*/infrastructure/drizzle/schema.ts',
        './src/infrastructure/drizzle/schema.ts'
    ],
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
