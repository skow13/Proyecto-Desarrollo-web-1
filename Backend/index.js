const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = 80;

// -------------------- CONFIGURACIÓN DE HANDLEBARS --------------------
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../Frontend')); // Carpeta de tus vistas .handlebars

// -------------------- MIDDLEWARES --------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../Public'))); // Carpeta con CSS, JS, imágenes, etc.

// -------------------- CONEXIÓN A MONGODB ATLAS --------------------
mongoose.connect('mongodb+srv://ruletadiego:dmmfh2014@cluster0.n28spxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('❌ Error conectando a MongoDB', err));

// -------------------- MODELO DE USUARIO --------------------
const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  usuario: String,
  password: String,
  fechaNacimiento: Date,
  saldo: { type: Number, default: 0 },
  transacciones: [
    {
      fecha: Date,
      detalle: String,
      monto: Number,
      positivo: Boolean
    }
  ]
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// -------------------- REGISTRO --------------------
app.post('/register', async (req, res) => {
  const { nombre, email, usuario, password, repassword, birthdate } = req.body;

  // Verificar que las contraseñas coincidan
  if (password !== repassword) {
    return res.render('registro', { error: 'Las contraseñas no coinciden' });
  }

  try {
    // Revisar si ya existe el usuario o el correo
    const existente = await Usuario.findOne({ $or: [{ usuario }, { email }] });
    if (existente) {
      return res.render('registro', { error: 'Usuario o correo ya registrados' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      usuario,
      password: hashedPassword,
      fechaNacimiento: birthdate
    });

    await nuevoUsuario.save();
    res.render('login', { success: 'Usuario registrado con éxito, inicia sesión' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.render('registro', { error: 'Error interno del servidor' });
  }
});

// -------------------- RUTAS --------------------

// Página principal
app.get('/', (req, res) => {
  res.render('Inicio');
});

// Página de registro
app.get('/register', (req, res) => {
  res.render('registro');
});

// Procesar registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ username, password: hashedPassword });
    await nuevoUsuario.save();
    res.render('login', { success: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar:', err);
    res.render('registro', { error: 'Error al registrar usuario' });
  }
});

// Página de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Procesar login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ usuario: username });

    if (!usuario) {
      return res.render('login', { error: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.render('login', { error: 'Contraseña incorrecta.' });
    }

    res.cookie('usuario', usuario.usuario, { httpOnly: true });

    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error en login:', err);
    res.render('login', { error: 'Error interno del servidor.' });
  }
});

app.post('/recuperar', async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.render('recuperarc', { error: 'No existe una cuenta con ese correo electrónico.' });
    }

    res.render('recuperarc', {
      success: 'Se ha enviado un enlace de recuperación (simulado). Revisa tu correo.'
    });
  } catch (err) {
    console.error('Error en recuperación:', err);
    res.render('recuperarc', { error: 'Error interno del servidor.' });
  }
});

app.get('/Perfil', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) {
      return res.redirect('/login');
    }

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) {
      return res.render('login', { error: 'Usuario no encontrado.' });
    }

    res.render('Perfil', {
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento
        ? usuario.fechaNacimiento.toLocaleDateString('es-CL')
        : 'No registrada',
      saldo: usuario.saldo.toLocaleString('es-CL'),
      transacciones: usuario.transacciones
    });
  } catch (err) {
    console.error('Error al cargar perfil:', err);
    res.render('login', { error: 'Error interno del servidor.' });
  }
});



// -------------------- INICIAR SERVIDOR --------------------
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
