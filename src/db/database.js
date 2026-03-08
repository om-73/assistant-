require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phoneNumber VARCHAR(255),
        email VARCHAR(255),
        linkedId INT DEFAULT NULL,
        linkPrecedence ENUM('primary', 'secondary') NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt DATETIME DEFAULT NULL
      );
    `);
    connection.release();
    console.log("Database table initialized.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

initDB();

module.exports = pool;