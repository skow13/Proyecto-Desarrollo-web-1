const ROJOS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const NEGROS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

/**
 * 
 * @returns {number} 
 */
function generarNumeroGanador() {
  return Math.floor(Math.random() * 37); 
}

/**
 * 
 * @param {number} numero 
 * @returns {string} 
 */
function obtenerColor(numero) {
  if (numero === 0) return 'verde';
  if (ROJOS.includes(numero)) return 'rojo';
  if (NEGROS.includes(numero)) return 'negro';
  return 'desconocido';
}

/**
 * 
 * @param {number} numero 
 * @returns {boolean}
 */
function esPar(numero) {
  if (numero === 0) return false;
  return numero % 2 === 0;
}

/**
 * 
 * @param {number} numero 
 * @returns {number|null} 
 */
function obtenerDocena(numero) {
  if (numero === 0) return null;
  if (numero >= 1 && numero <= 12) return 1;
  if (numero >= 13 && numero <= 24) return 2;
  if (numero >= 25 && numero <= 36) return 3;
  return null;
}

/**
 * 
 * @param {number} numero 
 * @returns {number|null} 
 */
function obtenerColumna(numero) {
  if (numero === 0) return null;
  if (numero % 3 === 1) return 1; 
  if (numero % 3 === 2) return 2; 
  if (numero % 3 === 0) return 3; 
  return null;
}

/**
 * 
 * @param {object} apuesta 
 * @param {number} numeroGanador 
 * @param {string} colorGanador 
 * @returns {object} 
 */
function evaluarApuesta(apuesta, numeroGanador, colorGanador) {
  const { tipo, valor, monto } = apuesta;
  
  let gana = false;
  let multiplicador = 0;

  switch (tipo) {
    case 'numero': 
      gana = valor === numeroGanador;
      multiplicador = gana ? 35 : 0;
      break;

    case 'color': 
      gana = valor === colorGanador && numeroGanador !== 0;
      multiplicador = gana ? 1 : 0;
      break;

    case 'paridad': 
      if (numeroGanador === 0) {
        gana = false;
      } else if (valor === 'par') {
        gana = esPar(numeroGanador);
      } else if (valor === 'impar') {
        gana = !esPar(numeroGanador);
      }
      multiplicador = gana ? 1 : 0;
      break;

    case 'grupo': 
      if (numeroGanador === 0) {
        gana = false;
      } else if (valor === 'bajo') {
        gana = numeroGanador >= 1 && numeroGanador <= 18;
      } else if (valor === 'alto') {
        gana = numeroGanador >= 19 && numeroGanador <= 36;
      }
      multiplicador = gana ? 1 : 0;
      break;

    case 'docena': 
      gana = obtenerDocena(numeroGanador) === valor;
      multiplicador = gana ? 2 : 0;
      break;

    case 'columna': 
      gana = obtenerColumna(numeroGanador) === valor;
      multiplicador = gana ? 2 : 0;
      break;

    default:
      console.warn(`Tipo de apuesta desconocido: ${tipo}`);
      gana = false;
      multiplicador = 0;
  }

  
  const pago = gana ? monto + (monto * multiplicador) : 0;
  
  return { gana, pago, multiplicador };
}

/**
 * 
 * @param {array} apuestas 
 * @returns {object} 
 */
function calcularResultado(apuestas) {
  
  const numeroGanador = generarNumeroGanador();
  const colorGanador = obtenerColor(numeroGanador);


  const totalApostado = apuestas.reduce((sum, a) => sum + a.monto, 0);


  let totalGanado = 0;
  const detalles = [];

  apuestas.forEach(apuesta => {
    const resultado = evaluarApuesta(apuesta, numeroGanador, colorGanador);
    
    totalGanado += resultado.pago;

   
    let descripcion = '';
    switch (apuesta.tipo) {
      case 'numero':
        descripcion = `Número ${apuesta.valor}`;
        break;
      case 'color':
        descripcion = apuesta.valor.charAt(0).toUpperCase() + apuesta.valor.slice(1);
        break;
      case 'paridad':
        descripcion = apuesta.valor.charAt(0).toUpperCase() + apuesta.valor.slice(1);
        break;
      case 'grupo':
        descripcion = apuesta.valor === 'bajo' ? '1-18' : '19-36';
        break;
      case 'docena':
        descripcion = `${apuesta.valor}° Docena`;
        break;
      case 'columna':
        descripcion = `Columna ${apuesta.valor}`;
        break;
      default:
        descripcion = `${apuesta.tipo} ${apuesta.valor}`;
    }

    const estado = resultado.gana ? 
      `Gana (+${resultado.pago})` : 
      `Pierde (-${apuesta.monto})`;

    detalles.push(`${descripcion}: $${apuesta.monto} → ${estado}`);
  });

 
  const gananciaNeta = totalGanado - totalApostado;

  return {
    resultado: {
      numero: numeroGanador,
      color: colorGanador
    },
    gananciaNeta,
    totalApostado,
    totalGanado,
    detalle: detalles.join(' | ')
  };
}

module.exports = {
  calcularResultado,
  generarNumeroGanador,
  obtenerColor,
  ROJOS,
  NEGROS
};