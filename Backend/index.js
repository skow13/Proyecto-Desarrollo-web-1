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
app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, '../Frontend/Layouts'),
  defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../Frontend'));
app.use(express.static(path.join(__dirname, '../Public')));

// -------------------- MIDDLEWARES --------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- CONEXIÓN A MONGODB --------------------
mongoose.connect('mongodb+srv://ruletadiego:dmmfh2014@cluster0.n28spxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// -------------------- MODELO DE USUARIO --------------------
const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  usuario: String,
  password: String,
  fechaNacimiento: Date,
  saldo: { type: Number, default: 1000000 },
  transacciones: [
    {
      fecha: { type: Date, default: Date.now },
      detalle: String,
      monto: Number,
      positivo: Boolean
    }
  ]
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// -------------------- RUTAS GET (vistas) --------------------
app.get('/', (req, res) => res.redirect('Inicio'));
app.get('/Login', (req, res) => res.render('Login'));
app.get('/Registro', (req, res) => res.render('Registro'));
app.get('/Recuperar', (req, res) => res.render('Recuperarc'));
app.get('/Ruleta', (req, res) => res.render('Ruleta'));
app.get('/Deposito', (req, res) => res.render('Deposito'));
app.get('/Retiro', (req, res) => res.render('Retiro'));
app.get('/Inicio', (req, res) => res.render('Inicio'));
app.get('/Info', (req, res) => res.render('Info'));
app.get('/Info_ruleta', (req, res) => res.render('Info_ruleta'));
app.get('/Perfil', (req, res) => res.render('Perfil'));


// -------------------- REGISTRO --------------------
app.post('/register', async (req, res) => {
  const { nombre, email, usuario, password, repassword, birthdate } = req.body;

  if (password !== repassword) {
    return res.render('Registro', { error: 'Las contraseñas no coinciden' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      usuario,
      password: hashedPassword,
      fechaNacimiento: birthdate,
      saldo: 0,
      transacciones: []
    });

    await nuevoUsuario.save();
    res.render('Login', { success: 'Usuario registrado con éxito. Ahora puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error en registro:', err);
    res.render('Registro', { error: 'Error al registrar el usuario.' });
  }
});

// -------------------- LOGIN --------------------
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const user = await Usuario.findOne({ usuario });
    if (!user) return res.render('Login', { error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('Login', { error: 'Contraseña incorrecta' });

    res.cookie('usuario', user.usuario, { httpOnly: true });
    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error en login:', err);
    res.render('Login', { error: 'Error interno del servidor' });
  }
});

// -------------------- PERFIL --------------------
app.get('/Perfil', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) return res.redirect('/Login');

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.render('Login', { error: 'Usuario no encontrado' });

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
    res.render('Login', { error: 'Error interno del servidor.' });
  }
});

// -------------------- CERRAR SESIÓN --------------------
app.get('/logout', (req, res) => {
  res.clearCookie('usuario');
  res.redirect('/Login');
});

// -------------------- INICIAR SERVIDOR --------------------
app.listen(port, () => {
  console.log(`💫 Servidor corriendo en http://localhost:${port}`);
  console.log('🟢 Vistas configuradas en:', path.join(__dirname, '../Frontend'));
});
