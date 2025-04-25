const express = require("express");
const router = express.Router();
const { 
  authenticateDoctor, 
  authenticatePatient,
  authorize 
} = require("../middleware/auth.middleware");
const {
  searchDoctors,
  searchAppointments,
  searchMedicalRecords,
} = require("../controllers/search.controller");

// Allow public access to search doctors
router.get("/doctors", searchDoctors);

// Protected routes require authentication
router.get("/appointments", authenticatePatient, searchAppointments);
router.get("/medical-records", authenticatePatient, searchMedicalRecords);

module.exports = router;
