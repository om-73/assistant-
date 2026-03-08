const express = require("express");
const router = express.Router();
const identityController = require("../controllers/identityController");

router.post("/identify", identityController.identify);

module.exports = router;