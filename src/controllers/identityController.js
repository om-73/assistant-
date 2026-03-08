const identityService = require("../services/identityService");

async function identify(req, res) {
  const { email, phoneNumber } = req.body;

  const mail = email || null;
  const phone = phoneNumber != null ? String(phoneNumber) : null;

  if (!mail && !phone) {
    return res.status(400).json({ error: "email or phoneNumber is required" });
  }

  try {
    const contact = await identityService.identify(mail, phone);
    return res.status(200).json({ contact });
  } catch (err) {
    console.error("Identity error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { identify };