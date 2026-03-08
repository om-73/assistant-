require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false
});

// Initialize table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INTEGER,
    linkPrecedence VARCHAR(10) NOT NULL CHECK (linkPrecedence IN ('primary', 'secondary')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
  );
`).catch(err => console.error("Error creating table:", err));

module.exports = pool;