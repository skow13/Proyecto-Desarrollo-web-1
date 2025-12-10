const express = require("express");
const { registro, login } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/register", registro);
router.post("/login", login);

module.exports = router;