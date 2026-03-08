const pool = require("../db/database");

function now() {
    return new Date().toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:MM:SS for MySQL
}

async function findByEmailOrPhone(email, phone) {
    const conditions = [];
    const params = [];

    if (email) {
        conditions.push(`email = ?`);
        params.push(email);
    }
    if (phone) {
        conditions.push(`phoneNumber = ?`);
        params.push(phone);
    }

    if (conditions.length === 0) return [];

    const query = `SELECT * FROM contact WHERE deletedAt IS NULL AND (${conditions.join(" OR ")})`;
    const [rows] = await pool.query(query, params);
    return rows;
}

async function findClusterByRootId(rootId) {
    const query = `SELECT * FROM contact WHERE deletedAt IS NULL AND (id = ? OR linkedId = ?)`;
    const [rows] = await pool.query(query, [rootId, rootId]);
    return rows;
}

async function createPrimary(email, phone) {
    const query = `
    INSERT INTO contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
    VALUES (?, ?, NULL, 'primary', ?, ?)
  `;
    const [result] = await pool.query(query, [phone, email, now(), now()]);
    return result.insertId;
}

async function createSecondary(email, phone, primaryId) {
    const query = `
    INSERT INTO contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
    VALUES (?, ?, ?, 'secondary', ?, ?)
  `;
    const [result] = await pool.query(query, [phone, email, primaryId, now(), now()]);
    return result.insertId;
}

async function demoteToSecondary(id, newPrimaryId) {
    const query = `
    UPDATE contact 
    SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = ? 
    WHERE id = ?
  `;
    await pool.query(query, [newPrimaryId, now(), id]);
}

module.exports = {
    findByEmailOrPhone,
    findClusterByRootId,
    createPrimary,
    createSecondary,
    demoteToSecondary,
};