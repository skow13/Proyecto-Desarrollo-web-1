
function guardarToken(token) {
  localStorage.setItem('token', token);
}


function obtenerToken() {
  return localStorage.getItem('token');
}


function eliminarToken() {
  localStorage.removeItem('token');
}

function estaAutenticado() {
  return !!obtenerToken();
}


function protegerRuta() {
  if (!estaAutenticado()) {
    window.location.href = '/Login';
    return false;
  }
  return true;
}

async function registrarUsuario(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const nombre = formData.get('nombre');
  const usuario = formData.get('usuario') || null;
  const correo = formData.get('email');
  const fechaNacimiento = formData.get('birthdate') || null;
  const password = formData.get('password');
  const repassword = formData.get('repassword');
  

  if (password !== repassword) {
    mostrarError('Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 6) {
    mostrarError('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, usuario, correo, fechaNacimiento, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      mostrarExito('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/Login';
      }, 2000);
    } else {
      mostrarError(data.msg || data.error || 'Error en el registro');
    }
    
  } catch (error) {
    console.error('Error en registro:', error);
    mostrarError('Error de conexión con el servidor');
  }
}


async function iniciarSesion(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const correo = formData.get('email') || formData.get('rut'); // Acepta email o rut
  const password = formData.get('password');
  
  if (!correo || !password) {
    mostrarError('Por favor completa todos los campos');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      guardarToken(data.token);
      mostrarExito('¡Inicio de sesión exitoso! Redirigiendo...');
      setTimeout(() => {
        window.location.href = '/Ruleta';
      }, 1500);
    } else {
      mostrarError(data.msg || data.error || 'Credenciales inválidas');
    }
    
  } catch (error) {
    console.error('Error en login:', error);
    mostrarError('Error de conexión con el servidor');
  }
}

function cerrarSesion() {
  eliminarToken();
  window.location.href = '/Inicio';
}

async function obtenerPerfil() {
  try {
    const response = await fetch('/api/user/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        eliminarToken();
        window.location.href = '/Login';
        return null;
      }
      throw new Error('Error al obtener perfil');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
}


function mostrarError(mensaje) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger';
  alertDiv.textContent = mensaje;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    padding: 1rem 2rem;
    background-color: var(--color-danger, #dc3545);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}


function mostrarExito(mensaje) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success';
  alertDiv.textContent = mensaje;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    padding: 1rem 2rem;
    background-color: var(--color-success, #28a745);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}


const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);