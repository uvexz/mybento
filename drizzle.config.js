/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require('dotenv');
const { defineConfig } = require('drizzle-kit');

dotenv.config({ path: '.env.local' });

module.exports = defineConfig({
    schema: './lib/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.POSTGRES_URL,
    },
});
