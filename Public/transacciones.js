document.addEventListener('DOMContentLoaded', async () => {
  if (!protegerRuta()) {
    return;
  }

  await cargarSaldoActual();
});

async function cargarSaldoActual() {
  try {
    const saldo = await obtenerSaldo();
    const saldoElement = document.getElementById('saldo-actual');
    if (saldoElement) {
      saldoElement.textContent = `$${saldo.toLocaleString('es-CL')}`;
    }
  } catch (error) {
    console.error('Error al cargar saldo:', error);
  }
}

async function procesarDeposito(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const monto = parseFloat(formData.get('monto'));
  
  if (!monto || monto <= 0) {
    mostrarError('El monto debe ser mayor a 0');
    return;
  }
  
  if (monto > 10000) {
    mostrarError('El monto máximo por depósito es $10,000');
    return;
  }
  
  try {
    const resultado = await realizarDeposito(monto);
    
    mostrarExito(`¡Depósito exitoso! Nuevo saldo: $${resultado.nuevoSaldo.toLocaleString('es-CL')}`);
    
    await cargarSaldoActual();
    
    form.reset();
    
    setTimeout(() => {
      window.location.href = '/Perfil';
    }, 2000);
    
  } catch (error) {
    mostrarError(error.message || 'Error al procesar depósito');
  }
}

async function procesarRetiro(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const monto = parseFloat(formData.get('monto'));
  
  if (!monto || monto <= 0) {
    mostrarError('El monto debe ser mayor a 0');
    return;
  }
  
  try {
    const resultado = await realizarRetiro(monto);
    
    mostrarExito(`¡Retiro exitoso! Nuevo saldo: $${resultado.nuevoSaldo.toLocaleString('es-CL')}`);
    
    await cargarSaldoActual();

    form.reset();
   
    setTimeout(() => {
      window.location.href = '/Perfil';
    }, 2000);
    
  } catch (error) {
    mostrarError(error.message || 'Error al procesar retiro');
  }
}