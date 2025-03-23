const express = require("express");
const router = express.Router();
// const multer = require('multer');
const {
  authenticateDoctor,
  authorize,
} = require("../middleware/auth.middleware");
const {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  updateAvailability,
  getDoctorPatients,
  createPost,
  updatePost,
  deletePost,
  getDoctorPublicProfile,
} = require("../controllers/doctor.controller");

// Add this new route BEFORE the authentication middleware
router.get("/public-profile/:doctorId", getDoctorPublicProfile);

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/posts');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

// All routes require authentication
router.use(authenticateDoctor);

// Doctor profile routes (doctors only)
router.post("/profile", authorize("doctor"), createDoctorProfile);
router.get("/profile", authorize("doctor"), getDoctorProfile);
router.put("/profile", authorize("doctor"), updateDoctorProfile);

// Availability management
router.get("/availability", authorize("doctor"), getDoctorAvailability);
router.put("/availability", authorize("doctor"), updateAvailability);

// Patient management
router.get("/patients", authorize("doctor"), getDoctorPatients);

// Posts management
router.post("/posts", authorize("doctor"), createPost);
router.put("/posts/:id", authorize("doctor"), updatePost);
router.delete("/posts/:id", authorize("doctor"), deletePost);

module.exports = router;
