#!/usr/bin/env node
// Applies pending Prisma migrations directly via SQL without the Prisma CLI
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:/app/data/carlos.db";
const dbPath = dbUrl.replace(/^file:/, "");
const migrationsDir = path.join(__dirname, "../prisma/migrations");

const db = new Database(dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  finished_at DATETIME,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at DATETIME,
  started_at DATETIME NOT NULL DEFAULT current_timestamp,
  applied_steps_count INTEGER NOT NULL DEFAULT 0
)`);

const applied = new Set(
  db.prepare("SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL").all().map((r) => r.migration_name)
);

const migrations = fs.readdirSync(migrationsDir)
  .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
  .sort();

for (const migration of migrations) {
  if (applied.has(migration)) continue;
  const sqlFile = path.join(migrationsDir, migration, "migration.sql");
  if (!fs.existsSync(sqlFile)) continue;

  const sql = fs.readFileSync(sqlFile, "utf8");
  console.log(`Applying migration: ${migration}`);
  db.exec(sql);
  db.prepare(
    "INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count) VALUES (?, ?, ?, datetime('now'), 1)"
  ).run(migration, migration, migration);
}

db.close();
console.log("Migrations done.");
