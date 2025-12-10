const express = require("express");
const authRoutes = require("./auth.routes.js");
const userRoutes = require("./user.routes.js");
const ruletaRoutes = require("./ruleta.routes.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/usuario", userRoutes);
router.use("/ruleta", ruletaRoutes);

module.exports = router;
