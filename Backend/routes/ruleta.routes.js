const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js"); 
const { jugarRuleta } = require("../controllers/ruleta.controller.js");

const router = express.Router();

router.post("/apostar", authMiddleware, jugarRuleta); 

module.exports = router;
