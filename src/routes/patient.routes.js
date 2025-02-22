const express = require("express");
const router = express.Router();
const {
  authenticatePatient,
  authorize,
} = require("../middleware/auth.middleware");
const {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  addMedicalHistory,
  getMedicalHistory,
  addToFavorites,
  getFavorites,
  removeFromFavorites
} = require("../controllers/patient.controller");

// All routes require authentication and patient role
router.use(authenticatePatient);
router.use(authorize("patient"));

// Patient profile routes
router.post("/profile", createPatientProfile);
router.get("/profile", getPatientProfile);
router.put("/profile", updatePatientProfile);

// Medical history routes
router.post("/medical-history", addMedicalHistory);
router.get("/medical-history", getMedicalHistory);

// Favorites routes
router.post('/favorites/:doctorId', addToFavorites);
router.get('/favorites', getFavorites);
router.delete('/favorites/:doctorId', removeFromFavorites);

module.exports = router;
