const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide a valid token",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "the-super-strong-secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    req.decoded = decoded;
    next();
  });
}

module.exports = verifyToken;
