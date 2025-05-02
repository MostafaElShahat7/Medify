const express = require("express");
const router = express.Router();
const {
  authenticateDoctor,
  authenticatePatient,
  authorize,
} = require("../middleware/auth.middleware");
const {
  createAppointment,
  getAppointments,
  updateAppointment,
} = require("../controllers/appointment.controller");

// Create appointment (patients only)
router.post('/', authenticatePatient, authorize("patient"), createAppointment);

// Get appointments for doctors
router.get("/doctor", authenticateDoctor, authorize("doctor"), getAppointments);

// Get appointments for patients
router.get("/patient", authenticatePatient, authorize("patient"), getAppointments);

// Get appointments (both doctors and patients) - fallback route
router.get("/", (req, res) => {
  res.status(400).json({ 
    message: "Please use /api/doctor or /api/patient endpoint based on your role" 
  });
});

// Update appointment (both doctors and patients)
router.patch("/:id",
  (req, res, next) => {
    const authMiddleware = req.headers['x-user-type'] === 'doctor' 
      ? authenticateDoctor 
      : authenticatePatient;
    authMiddleware(req, res, next);
  },
  authorize("doctor", "patient"), 
  updateAppointment
);

module.exports = router;
