const db = require("../db/database");

function now() {
    return new Date().toISOString();
}

function findByEmailOrPhone(email, phone) {
    const conditions = [];
    const params = [];
    if (email) { conditions.push("email = ?"); params.push(email); }
    if (phone) { conditions.push("phoneNumber = ?"); params.push(phone); }

    if (conditions.length === 0) return [];

    return db
        .prepare(`SELECT * FROM Contact WHERE deletedAt IS NULL AND (${conditions.join(" OR ")})`)
        .all(...params);
}

function findClusterByRootId(rootId) {
    return db
        .prepare(`SELECT * FROM Contact WHERE deletedAt IS NULL AND (id = ? OR linkedId = ?)`)
        .all(rootId, rootId);
}

function createPrimary(email, phone) {
    const result = db
        .prepare(
            `INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
       VALUES (?, ?, NULL, 'primary', ?, ?)`
        )
        .run(phone, email, now(), now());
    return result.lastInsertRowid;
}

function createSecondary(email, phone, primaryId) {
    const result = db
        .prepare(
            `INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
       VALUES (?, ?, ?, 'secondary', ?, ?)`
        )
        .run(phone, email, primaryId, now(), now());
    return result.lastInsertRowid;
}

function demoteToSecondary(id, newPrimaryId) {
    db.prepare(
        `UPDATE Contact SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = ? WHERE id = ?`
    ).run(newPrimaryId, now(), id);
}

module.exports = {
    findByEmailOrPhone,
    findClusterByRootId,
    createPrimary,
    createSecondary,
    demoteToSecondary,
};