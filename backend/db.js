const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const useSSL = process.env.PGSSLMODE && process.env.PGSSLMODE !== "disable";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: useSSL
    ? {
        rejectUnauthorized: process.env.PGSSLMODE === "verify-full",
        ca: fs.existsSync(path.resolve(__dirname, "root.crt"))
          ? fs.readFileSync(path.resolve(__dirname, "root.crt"), "utf-8")
          : undefined,
      }
    : false,
});

module.exports = pool;
