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
router.post("/availability", authorize("doctor"), updateAvailability);

// Patient management
router.get("/patients", authorize("doctor"), getDoctorPatients);

// Posts management
const handlePostUpload = upload.fields([
  { name: 'content', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

router.post("/posts", authorize("doctor"), (req, res, next) => {
  handlePostUpload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        message: "File upload error", 
        error: err.message,
        type: 'MulterError'
      });
    } else if (err) {
      return res.status(400).json({ 
        message: "Unknown error", 
        error: err.message,
        type: 'UnknownError'
      });
    }
    // Add the content from fields to body if it exists
    if (req.body && !req.body.content && req.fields && req.fields.content) {
      req.body.content = req.fields.content;
    }
    next();
  });
}, createPost);

router.put("/posts/:id", authorize("doctor"), upload.single('image'), updatePost);
router.delete("/posts/:id", authorize("doctor"), deletePost);

module.exports = router;
