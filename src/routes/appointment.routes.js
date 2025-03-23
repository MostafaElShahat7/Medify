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

// All routes require authentication
// router.use(authenticateDoctor);

// Create appointment (patients only)
router.post('/', authenticatePatient, authorize("patient"), createAppointment);
// Get appointments (both doctors and patients)
router.get("/", 
  (req, res, next) => {
    const authMiddleware = req.headers['x-user-type'] === 'doctor' 
      ? authenticateDoctor 
      : authenticatePatient;
    authMiddleware(req, res, next);
  },
  authorize("doctor", "patient"), 
  getAppointments
);
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
