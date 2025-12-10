const Usuario = require("../models/Usuario.js");


exports.getPerfil = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = await Usuario.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error en getPerfil:", err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};


exports.depositar = async (req, res) => {
  try {
    const { monto } = req.body;

    if (!monto || isNaN(monto) || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    if (monto > 10000) {
      return res.status(400).json({ error: "El monto máximo por depósito es $10,000" });
    }

    const user = await Usuario.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.saldo += parseFloat(monto);
    
    user.historial.push({
      tipo: "deposito",
      monto: parseFloat(monto),
      descripcion: `Depósito de $${monto}`,
      fecha: new Date()
    });

    await user.save();

    res.json({
      msg: "Depósito exitoso",
      nuevoSaldo: user.saldo,
      transaccion: user.historial[user.historial.length - 1]
    });

  } catch (err) {
    console.error("Error en depositar:", err);
    res.status(500).json({ error: "Error al procesar depósito" });
  }
};

exports.retirar = async (req, res) => {
  try {
    const { monto } = req.body;

    // Validaciones
    if (!monto || isNaN(monto) || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const user = await Usuario.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.saldo < monto) {
      return res.status(400).json({ 
        error: "Saldo insuficiente",
        saldoActual: user.saldo
      });
    }

    user.saldo -= parseFloat(monto);
    
   
    user.historial.push({
      tipo: "retiro",
      monto: parseFloat(monto),
      descripcion: `Retiro de $${monto}`,
      fecha: new Date()
    });

    await user.save();

    res.json({
      msg: "Retiro exitoso",
      nuevoSaldo: user.saldo,
      transaccion: user.historial[user.historial.length - 1]
    });

  } catch (err) {
    console.error("Error en retirar:", err);
    res.status(500).json({ error: "Error al procesar retiro" });
  }
};


exports.getHistorial = async (req, res) => {
  try {
    const user = await Usuario.findById(req.userId).select("historial");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

   
    const historialOrdenado = user.historial.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );

    res.json({
      historial: historialOrdenado,
      total: historialOrdenado.length
    });

  } catch (err) {
    console.error("Error en getHistorial:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};


exports.getSaldo = async (req, res) => {
  try {
    const user = await Usuario.findById(req.userId).select("saldo");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ saldo: user.saldo });

  } catch (err) {
    console.error("Error en getSaldo:", err);
    res.status(500).json({ error: "Error al obtener saldo" });
  }
};