const express = require("express");
const { 
  getPerfil, 
  depositar, 
  retirar, 
  getHistorial,
  getSaldo 
} = require("../controllers/user.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();

router.use(authMiddleware);

router.get("/perfil", getPerfil);

router.get("/saldo", getSaldo);

router.post("/depositar", depositar);
router.post("/retirar", retirar);

router.get("/historial", getHistorial);

module.exports = router;