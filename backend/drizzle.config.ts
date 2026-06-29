import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

console.log(process.env.DATABASE_URL)

export default defineConfig({
    out: './drizzle', 
    schema: [
        './src/modules/*/infrastructure/drizzle/schema.ts',
        './src/infrastructure/drizzle/schema.ts'
    ],
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
