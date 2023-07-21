const { verifyToken } = require("../utils/userAuthUtils");

function authenticate(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token found. Authorization denied." });
  }

  const payload = verifyToken(token);
  req.userId = payload.id;
  next();
}

module.exports = { authenticate };
