const { verifyToken } = require("../utils/jwt.util");

const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
const Admin = require("../models/admin.model");

const authenticateDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) {
      return res.status(401).json({ message: "Doctor not found" });
    }

    // Set the complete doctor object
    req.user = doctor;
    req.user.role = "doctor";
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const authenticatePatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    const user = await Patient.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      ...user,
      role: "patient"
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log("[ADMIN AUTH] Decoded token:", decoded);

    const user = await Admin.findById(decoded.id);
    console.log("[ADMIN AUTH] Admin user found:", user);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Ensure req.user is a plain object with all fields
    req.user = user.toObject ? user.toObject() : user;
    req.user.role = "admin";
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    let user = await Doctor.findById(decoded.id);
    if (user) {
      req.user = user;
      req.user.role = "doctor";
      return next();
    }

    user = await Patient.findById(decoded.id);
    if (user) {
      req.user = user;
      req.user.role = "patient";
      return next();
    }

    return res.status(401).json({ message: "User not found" });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("--------------------------------------------");
    console.log(req.user);
    console.log("--------------------------------------------");

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }
    next();
  };
};

module.exports = {
  authenticateDoctor,
  authenticatePatient,
  authenticateAdmin,
  authorize,
  authenticateUser
};
