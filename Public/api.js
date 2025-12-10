async function peticionAutenticada(url, options = {}) {
  const token = obtenerToken();
  
  if (!token) {
    window.location.href = '/Login';
    throw new Error('No autenticado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      eliminarToken();
      window.location.href = '/Login';
      throw new Error('Sesión expirada');
    }
    
    return response;
    
  } catch (error) {
    console.error('Error en petición:', error);
    throw error;
  }
}

async function obtenerSaldo() {
  try {
    const response = await peticionAutenticada('/api/user/saldo');
    
    if (!response.ok) {
      throw new Error('Error al obtener saldo');
    }
    
    const data = await response.json();
    return data.saldo;
    
  } catch (error) {
    console.error('Error al obtener saldo:', error);
    return 0;
  }
}


async function realizarDeposito(monto) {
  try {
    const response = await peticionAutenticada('/api/user/depositar', {
      method: 'POST',
      body: JSON.stringify({ monto })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el depósito');
    }
    
    return data;
    
  } catch (error) {
    console.error('Error en depósito:', error);
    throw error;
  }
}


async function realizarRetiro(monto) {
  try {
    const response = await peticionAutenticada('/api/user/retirar', {
      method: 'POST',
      body: JSON.stringify({ monto })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el retiro');
    }
    
    return data;
    
  } catch (error) {
    console.error('Error en retiro:', error);
    throw error;
  }
}


async function obtenerHistorial() {
  try {
    const response = await peticionAutenticada('/api/user/historial');
    
    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }
    
    const data = await response.json();
    return data.historial || [];
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
}


async function apostarRuleta(apuestas) {
  try {
    const response = await peticionAutenticada('/api/ruleta/apostar', {
      method: 'POST',
      body: JSON.stringify({ apuestas })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error en la apuesta');
    }
    
    return data;
    
  } catch (error) {
    console.error('Error en apuesta:', error);
    throw error;
  }
}