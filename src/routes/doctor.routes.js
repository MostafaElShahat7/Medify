const express = require("express");
const router = express.Router();
const multer = require('multer');
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

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Add file filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
router.post("/posts", authorize("doctor"), upload.single('image'), createPost);
router.put("/posts/:id", authorize("doctor"), upload.single('image'), updatePost);
router.delete("/posts/:id", authorize("doctor"), deletePost);

module.exports = router;
