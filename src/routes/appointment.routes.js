const express = require("express");
const router = express.Router();
const {
  authenticateDoctor,
  authorize,
} = require("../middleware/auth.middleware");
const {
  createAppointment,
  getAppointments,
  updateAppointment,
} = require("../controllers/appointment.controller");

// All routes require authentication
router.use(authenticateDoctor);

// Create appointment (patients only)
router.post('/appointments', createAppointment);
// Get appointments (both doctors and patients)
router.get("/", authorize("doctor", "patient"), getAppointments);

// Update appointment (both doctors and patients)
router.patch("/:id", authorize("doctor", "patient"), updateAppointment);

module.exports = router;
