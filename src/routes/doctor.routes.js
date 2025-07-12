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
  getDoctorAvailabilityById,
  getAllPosts,
  getAvailableTimeSlots,
  uploadVerificationImage,
  uploadProfilePicture
} = require("../controllers/doctor.controller");
const { getPatientProfileById } = require("../controllers/patient.controller");
const { getPatientAppointments, getPatientAllAppointments } = require("../controllers/appointment.controller");


router.get("/public-profile/:doctorId", getDoctorPublicProfile);


router.get("/availability/:doctorId", getDoctorAvailabilityById);

// Get available time slots for a doctor on a specific date
router.get("/availability/:doctorId/slots/:date", getAvailableTimeSlots);

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
router.get("/patient-profile/:patientId", authorize("doctor"), getPatientProfileById);
router.get("/patient-appointments/:patientId", authorize("doctor"), getPatientAppointments);
router.get("/patient-all-appointments/:patientId", authorize("doctor"), getPatientAllAppointments);

// Posts management
router.post("/posts", 
  authorize("doctor"),
  upload.single('image'),
  validatePostContent,
  createPost
);

router.put("/posts/:id", authorize("doctor"), upload.single('image'), updatePost);
router.delete("/posts/:id", authorize("doctor"), deletePost);

// Verification image upload
router.post(
  "/verification-image",
  authorize("doctor"),
  upload.single('image'),
  uploadVerificationImage
);

// Profile picture upload
router.post(
  "/profile-picture",
  authorize("doctor"),
  upload.single('image'),
  uploadProfilePicture
);

module.exports = router;
