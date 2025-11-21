const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('local.db');

const migrationsDir = path.join(__dirname, '../drizzle');

if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found!');
    process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

files.sort(); // Ensure order

for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
}

console.log('Migrations applied!');
