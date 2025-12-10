const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ msg: "No autorizado: falta token" });
    }
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "Token mal formado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (e) {
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
