const { calcularResultado } = require('../services/ruleta.service.js');
const Usuario = require('../models/Usuario.js');


async function jugarRuleta(req, res) {
  try {
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    const { apuestas } = req.body;

    if (!apuestas || !Array.isArray(apuestas) || apuestas.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Debes hacer al menos una apuesta" 
      });
    }

    for (const apuesta of apuestas) {
      if (!apuesta.tipo || apuesta.valor === undefined || !apuesta.monto) {
        return res.status(400).json({ 
          success: false, 
          error: "Formato de apuesta inválido" 
        });
      }

      if (apuesta.monto <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: "El monto de apuesta debe ser positivo" 
        });
      }
    }

    const totalApostado = apuestas.reduce((acc, a) => acc + a.monto, 0);

    if (usuario.saldo < totalApostado) {
      return res.status(400).json({ 
        success: false, 
        error: 'Saldo insuficiente', 
        saldoActual: usuario.saldo,
        requiereMinimo: totalApostado
      });
    }

    const resultado = calcularResultado(apuestas);

    usuario.saldo += resultado.gananciaNeta;

    usuario.historial.push({
      tipo: resultado.gananciaNeta >= 0 ? 'ganancia' : 'apuesta',
      monto: Math.abs(resultado.gananciaNeta),
      descripcion: `Ruleta - Número ${resultado.resultado.numero} (${resultado.resultado.color}). ${resultado.detalle}`,
      fecha: new Date()
    });

    await usuario.save();

    return res.json({
      success: true,
      resultado: resultado.resultado,
      gananciaNeta: resultado.gananciaNeta,
      totalApostado: resultado.totalApostado,
      totalGanado: resultado.totalGanado,
      saldo: usuario.saldo,
      detalle: resultado.detalle
    });

  } catch (err) {
    console.error('Error en jugarRuleta:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

module.exports = { jugarRuleta };