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
  username: String,
  password: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// -------------------- RUTAS --------------------

// Página principal
app.get('/', (req, res) => {
  res.render('Inicio'); // Renderiza Frontend/Inicio.handlebars
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
    const usuario = await Usuario.findOne({ username });
    if (!usuario) return res.render('login', { error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.render('login', { error: 'Contraseña incorrecta' });

    res.render('Perfil', { username });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.render('login', { error: 'Error interno del servidor' });
  }
});

// -------------------- INICIAR SERVIDOR --------------------
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
