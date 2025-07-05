const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticateDoctor, authenticatePatient, authorize } = require("../middleware/auth.middleware");

const {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
} = require("../controllers/message.controller");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/messages");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// Middleware to authenticate both doctors and patients
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const { verifyToken } = require("../utils/jwt.util");
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // Try to find user in both Doctor and Patient collections
    const Doctor = require("../models/doctor.model");
    const Patient = require("../models/patient.model");

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

// All routes require authentication
router.use(authenticateUser);


// Message routes
router.post("/", upload.array("attachments"), sendMessage);
router.get("/conversations", getConversations);
router.get("/unread", getUnreadCount);
router.get("/:userId", getMessages);

module.exports = router;
