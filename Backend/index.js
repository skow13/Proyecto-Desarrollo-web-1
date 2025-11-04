const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = 80;

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Conexión MongoDB Atlas
mongoose.connect('mongodb+srv://ruletadiego:dmmfh2014@cluster0.n28spxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB', err));

// Modelo Usuario
const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Rutas principales
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Registro de usuario con bcrypt
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ username, password: hashedPassword });
    await nuevoUsuario.save();
    res.render('login', { success: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar:', err);
    res.render('register', { error: 'Error al registrar usuario' });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Login con bcrypt
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ username });
    if (!usuario) return res.render('login', { error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.render('login', { error: 'Contraseña incorrecta' });

    res.render('welcome', { username });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.render('login', { error: 'Error interno del servidor' });
  }
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});