const repo = require("../db/contactRepository");

function getAllClusters(matched) {
  const rootIds = new Set();
  for (const c of matched) {
    rootIds.add(c.linkPrecedence === "primary" ? c.id : c.linkedId);
  }

  const seen = new Set();
  const allContacts = [];

  for (const rid of rootIds) {
    const cluster = repo.findClusterByRootId(rid);
    for (const c of cluster) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        allContacts.push(c);
      }
    }
  }

  return allContacts;
}

function resolvePrimary(allContacts) {
  const primaries = allContacts
    .filter((c) => c.linkPrecedence === "primary")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const primary = primaries[0];

  // Demote any newer primaries
  for (const p of primaries.slice(1)) {
    repo.demoteToSecondary(p.id, primary.id);
    p.linkedId = primary.id;
    p.linkPrecedence = "secondary";
  }

  return primary;
}

function buildResponse(primary, allContacts) {
  const emails = [
    primary.email,
    ...allContacts
      .filter((c) => c.id !== primary.id && c.email && c.email !== primary.email)
      .map((c) => c.email),
  ].filter(Boolean);

  const phones = [
    primary.phoneNumber,
    ...allContacts
      .filter((c) => c.id !== primary.id && c.phoneNumber && c.phoneNumber !== primary.phoneNumber)
      .map((c) => c.phoneNumber),
  ].filter(Boolean);

  const secondaryIds = allContacts
    .filter((c) => c.linkPrecedence === "secondary")
    .map((c) => c.id);

  return {
    primaryContatctId: primary.id,
    emails: [...new Set(emails)],
    phoneNumbers: [...new Set(phones)],
    secondaryContactIds: secondaryIds,
  };
}

function identify(email, phone) {
  const matched = repo.findByEmailOrPhone(email, phone);

  // No existing contact → create new primary
  if (matched.length === 0) {
    const id = repo.createPrimary(email, phone);
    return {
      primaryContatctId: id,
      emails: email ? [email] : [],
      phoneNumbers: phone ? [phone] : [],
      secondaryContactIds: [],
    };
  }

  // Gather all related contacts across clusters
  let allContacts = getAllClusters(matched);

  // Find (and enforce) a single primary
  const primary = resolvePrimary(allContacts);

  // Check if incoming info introduces anything new
  const emailKnown = !email || allContacts.some((c) => c.email === email);
  const phoneKnown = !phone || allContacts.some((c) => c.phoneNumber === phone);

  if (!emailKnown || !phoneKnown) {
    repo.createSecondary(email, phone, primary.id);
    // Reload cluster with the new secondary included
    allContacts = repo.findClusterByRootId(primary.id);
  }

  return buildResponse(primary, allContacts);
}

module.exports = { identify };