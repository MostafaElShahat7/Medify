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

// Configure multer to store files in memory with basic settings
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Custom middleware to ensure content exists
const validatePostContent = (req, res, next) => {
  console.log('Validating post content');
  console.log('Body:', req.body);
  
  if (!req.body || !req.body.content) {
    return res.status(400).json({
      message: 'Content is required',
      received: {
        body: req.body,
        contentType: req.headers['content-type']
      }
    });
  }
  next();
};

// All routes require authentication
router.use(authenticateDoctor);

// Doctor profile routes
router.post("/profile", authorize("doctor"), createDoctorProfile);
router.get("/profile", authorize("doctor"), getDoctorProfile);
router.put("/profile", authorize("doctor"), updateDoctorProfile);

// Availability management
router.get("/availability", authorize("doctor"), getDoctorAvailability);
router.post("/availability", authorize("doctor"), updateAvailability);

// Patient management
router.get("/patients", authorize("doctor"), getDoctorPatients);

// Posts management
router.post("/posts", 
  authorize("doctor"),
  upload.single('image'),
  validatePostContent,
  createPost
);

router.put("/posts/:id", authorize("doctor"), upload.single('image'), updatePost);
router.delete("/posts/:id", authorize("doctor"), deletePost);

module.exports = router;
