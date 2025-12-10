require('dotenv').config({ path: "process.env"} );
const Usuario = require("../models/Usuario.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRO
exports.registro = async (req, res) => {
  try {
    let { nombre, rut, usuario, correo, fechaNacimiento, password } = req.body;

    if (!nombre || !correo || !password)
      return res.status(400).json({ msg: "Faltan datos obligatorios" });

    correo = correo.toLowerCase();

    const correoRegex = /\S+@\S+\.\S+/;
    if (!correoRegex.test(correo))
      return res.status(400).json({ msg: "Correo inválido" });

    const existe = await Usuario.findOne({ correo });
    if (existe)
      return res.status(400).json({ msg: "Correo ya registrado" });

    const nuevo = await Usuario.create({
      nombre,
      rut: rut || null,
      usuario: usuario || null,
      correo,
      fechaNacimiento: fechaNacimiento || null,
      password: password, 
      saldo: 0,
    });

    return res.status(201).json({
      msg: "Usuario registrado",
      user: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        correo: nuevo.correo,
      }
    });

  } catch (e) {
    console.error("Error en registro:", e);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// LOGIN 
exports.login = async (req, res) => {
  try {
    let { correo, password } = req.body;

    if (!correo || !password)
      return res.status(400).json({ msg: "Faltan datos" });

    correo = correo.toLowerCase();

    const user = await Usuario.findOne({ correo }).select("+password");
    
    if (!user)
      return res.status(400).json({ msg: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);

    if (!ok)
      return res.status(400).json({ msg: "Credenciales inválidas" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ msg: "Error en servidor: falta JWT_SECRET" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      msg: "Login exitoso",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        saldo: user.saldo,
      },
    });

  } catch (e) {
    console.error("Error en login:", e);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};