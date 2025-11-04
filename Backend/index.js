const bcrypt = require('bcrypt');
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const port = 80;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Modelo de Usuario
const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

app.get('/register', (req, res) => {
  res.render('register');
});
// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Encriptar la contraseña antes de guardarla
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de salt rounds

    const nuevoUsuario = new Usuario({ username, password: hashedPassword });
    await nuevoUsuario.save();

    res.send('Usuario registrado con éxito');
  } catch (err) {
    console.error('Error al encriptar la contraseña:', err);
    res.send('Error al registrar el usuario');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para login de usuario
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ username });

    if (!usuario) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
    }

    // Comparar la contraseña ingresada con la contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
    }

    res.render('welcome', { username });
  } catch (err) {
    console.error('Error al buscar usuario:', err);
    res.send('Error interno del servidor');
  }
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});

mongoose.connect('mongodb+srv://ruletadiego:dmmfh2014@cluster0.n28spxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a MongoDB Atlas');
}).catch(err => {
  console.error('Error conectando a MongoDB', err);
});