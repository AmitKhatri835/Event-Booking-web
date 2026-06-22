const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No Token Provided",
    });
  }

  try {
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }

    next();
  } catch (err) {
    console.error("Authentication Error:", err);

    return res.status(401).json({
      message: "Token Failed",
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access Denied: Admins Only",
  });
};

module.exports = {
  authMiddleware,
  admin,
};
