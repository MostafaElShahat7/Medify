const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  updateAvailability,
  getDoctorPatients
} = require('../controllers/doctor.controller');

// All routes require authentication
router.use(authenticate);

// Doctor profile routes (doctors only)
router.post('/profile', authorize('doctor'), createDoctorProfile);
router.get('/profile', authorize('doctor'), getDoctorProfile);
router.put('/profile', authorize('doctor'), updateDoctorProfile);

// Availability management
router.get('/availability', authorize('doctor'), getDoctorAvailability);
router.put('/availability', authorize('doctor'), updateAvailability);

// Patient management
router.get('/patients', authorize('doctor'), getDoctorPatients);

module.exports = router;