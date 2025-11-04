const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = 80;

app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, '../Frontend/Layouts'),
  defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../Frontend'));
app.use(express.static(path.join(__dirname, '../Public')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect('mongodb+srv://ruletadiego:dmmfh2014@cluster0.n28spxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  usuario: String,
  password: String,
  fechaNacimiento: Date,
  saldo: { type: Number, default: 0 },
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

//rutas
app.get('/', (req, res) => res.redirect('Inicio'));
app.get('/Login', (req, res) => res.render('Login'));
app.get('/Registro', (req, res) => res.render('Registro'));
app.get('/Recuperar', (req, res) => res.render('Recuperarc'));
app.get('/Inicio', (req, res) => res.render('Inicio'));
app.get('/Info', (req, res) => res.render('Info'));
app.get('/Info_ruleta', (req, res) => res.render('Info_ruleta'));

app.post('/register', async (req, res) => {
  const { nombre, email, usuario, password, repassword, birthdate } = req.body;

  if (password !== repassword) {
    return res.render('Registro', { error: 'Las contraseñas no coinciden' });
  }

  try {
    const existe = await Usuario.findOne({ usuario });
    if (existe) {
      return res.render('Registro', { error: 'El nombre de usuario ya existe' });
    }

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

app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const user = await Usuario.findOne({ usuario });
    if (!user) return res.render('Login', { error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('Login', { error: 'Contraseña incorrecta' });
    res.cookie('usuario', user.usuario, { httpOnly: false });
    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error en login:', err);
    res.render('Login', { error: 'Error interno del servidor' });
  }
});
app.get('/Perfil', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) return res.redirect('/Login');

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.render('Login', { error: 'Usuario no encontrado' });

    const ultimasTransacciones = usuario.transacciones.slice(-5).reverse();

    res.render('Perfil', {
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento
        ? usuario.fechaNacimiento.toLocaleDateString('es-CL')
        : 'No registrada',
      saldo: usuario.saldo.toLocaleString('es-CL'),
      transacciones: ultimasTransacciones
    });
  } catch (err) {
    console.error('Error al cargar perfil:', err);
    res.render('Login', { error: 'Error interno del servidor.' });
  }
});

app.get('/Ruleta', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) return res.redirect('/Login');

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.redirect('/Login');

    res.render('Ruleta', {
      saldo: usuario.saldo.toLocaleString('es-CL'),
      estado: 'Esperando apuesta'
    });
  } catch (err) {
    console.error('Error al cargar ruleta:', err);
    res.render('Ruleta', { saldo: 0, estado: 'Error cargando saldo' });
  }
});

app.get('/Deposito', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) return res.redirect('/Login');

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.redirect('/Login');

    res.render('Deposito', {
      saldo: usuario.saldo.toLocaleString('es-CL')
    });
  } catch (err) {
    console.error('Error al cargar depósito:', err);
    res.render('Deposito', { saldo: 0, error: 'Error cargando saldo' });
  }
});

app.post('/Deposito', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    const { monto } = req.body;
    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.redirect('/Login');

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.render('Deposito', { saldo: usuario.saldo, error: 'Monto inválido' });
    }

    usuario.saldo += montoNum;
    usuario.transacciones.push({
      detalle: `Depósito de $${montoNum}`,
      monto: montoNum,
      positivo: true
    });

    await usuario.save();
    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error al realizar depósito:', err);
    res.render('Deposito', { saldo: 0, error: 'Error interno del servidor' });
  }
});

app.get('/Retiro', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    if (!username) return res.redirect('/Login');

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.redirect('/Login');

    res.render('Retiro', {
      saldo: usuario.saldo.toLocaleString('es-CL')
    });
  } catch (err) {
    console.error('Error al cargar retiro:', err);
    res.render('Retiro', { saldo: 0, error: 'Error cargando saldo' });
  }
});

app.post('/Retiro', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    const { monto } = req.body;
    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.redirect('/Login');

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0 || montoNum > usuario.saldo) {
      return res.render('Retiro', {
        saldo: usuario.saldo.toLocaleString('es-CL'),
        error: 'Monto inválido o insuficiente'
      });
    }

    usuario.saldo -= montoNum;
    usuario.transacciones.push({
      detalle: `Retiro de $${montoNum}`,
      monto: montoNum,
      positivo: false
    });

    await usuario.save();
    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error al realizar retiro:', err);
    res.render('Retiro', { saldo: 0, error: 'Error interno del servidor' });
  }
});

//xd
app.post('/transaccion', async (req, res) => {
  try {
    const username = req.cookies.usuario;
    const { detalle, monto, positivo } = req.body;

    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    const montoNum = Number(monto);
    usuario.transacciones.push({
      detalle,
      monto: montoNum,
      positivo: positivo === 'true'
    });

    if (positivo === 'true') {
      usuario.saldo += montoNum;
    } else {
      usuario.saldo -= montoNum;
    }

    await usuario.save();
    res.redirect('/Perfil');
  } catch (err) {
    console.error('Error al registrar transacción:', err);
    res.status(500).send('Error al registrar transacción');
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