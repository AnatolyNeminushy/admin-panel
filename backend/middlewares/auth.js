const { verify } = require("../utils/jwt");

module.exports = function auth(required = true) {
  return (req, res, next) => {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: "No token" });
      req.user = null;
      return next();
    }

    try {
      const payload = verify(token);
      req.user = payload; // { id, email, role }
      next();
    } catch (e) {
      console.warn('[auth] verify failed:', e.name, e.message);
      if (required) return res.status(401).json({ error: "Invalid token" });
      req.user = null;
      next();
    }
  };
};
