require("dotenv").config({path:"process.env"});
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");

const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const ruletaRoutes = require("./routes/ruleta.routes.js");

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error Mongo:", err));


app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "../Frontend/Layouts"),
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../Frontend"));


app.use(express.static(path.join(__dirname, "../Public")));


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ruleta", ruletaRoutes);


app.get("/", (req, res) => res.redirect("/Inicio"));
app.get("/Inicio", (req, res) => res.render("Inicio"));
app.get("/Login", (req, res) => res.render("Login"));
app.get("/Registro", (req, res) => res.render("Registro"));
app.get("/Perfil", (req, res) => res.render("Perfil"));
app.get("/Ruleta", (req, res) => res.render("Ruleta"));
app.get("/Deposito", (req, res) => res.render("Deposito"));
app.get("/Retiro", (req, res) => res.render("Retiro"));
app.get("/Info", (req, res) => res.render("Info"));
app.get("/Info_ruleta", (req, res) => res.render("Info_ruleta"));
app.get("/Recuperarc", (req, res) => res.render("Recuperarc"));


app.get("/logout", (req, res) => {
  res.send(`
    <script>
      localStorage.removeItem('token');
      window.location.href = '/Inicio';
    </script>
  `);
});


app.use((req, res) => {
  res.status(404).render("404", { mensaje: "Página no encontrada" });
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Backend API corriendo en el puerto ${PORT}`);
});