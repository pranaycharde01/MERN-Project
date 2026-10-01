const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const facultyOnly = (req, res, next) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({
      message: "Faculty access required"
    });
  }

  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      message: "Student access required"
    });
  }

  next();
};

module.exports = {
  auth,
  facultyOnly,
  studentOnly
};
