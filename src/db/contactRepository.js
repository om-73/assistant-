const pool = require("../db/database");

function now() {
    return new Date().toISOString();
}

async function findByEmailOrPhone(email, phone) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (email) {
        conditions.push(`email = $${paramIndex++}`);
        params.push(email);
    }
    if (phone) {
        conditions.push(`"phoneNumber" = $${paramIndex++}`);
        params.push(phone);
    }

    if (conditions.length === 0) return [];

    const query = `SELECT * FROM contact WHERE "deletedAt" IS NULL AND (${conditions.join(" OR ")})`;
    const result = await pool.query(query, params);
    return result.rows;
}

async function findClusterByRootId(rootId) {
    const query = `SELECT * FROM contact WHERE "deletedAt" IS NULL AND (id = $1 OR "linkedId" = $2)`;
    const result = await pool.query(query, [rootId, rootId]);
    return result.rows;
}

async function createPrimary(email, phone) {
    const query = `
    INSERT INTO contact ("phoneNumber", email, "linkedId", "linkPrecedence", "createdAt", "updatedAt")
    VALUES ($1, $2, NULL, 'primary', $3, $4)
    RETURNING id
  `;
    const result = await pool.query(query, [phone, email, now(), now()]);
    return result.rows[0].id;
}

async function createSecondary(email, phone, primaryId) {
    const query = `
    INSERT INTO contact ("phoneNumber", email, "linkedId", "linkPrecedence", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, 'secondary', $4, $5)
    RETURNING id
  `;
    const result = await pool.query(query, [phone, email, primaryId, now(), now()]);
    return result.rows[0].id;
}

async function demoteToSecondary(id, newPrimaryId) {
    const query = `
    UPDATE contact 
    SET "linkedId" = $1, "linkPrecedence" = 'secondary', "updatedAt" = $2 
    WHERE id = $3
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