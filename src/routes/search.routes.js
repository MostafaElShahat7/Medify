const express = require("express");
const router = express.Router();
const { authenticateDoctor } = require("../middleware/auth.middleware");
const {
  searchDoctors,
  searchAppointments,
  searchMedicalRecords,
} = require("../controllers/search.controller");

router.use(authenticateDoctor);

router.get("/doctors", searchDoctors);
router.get("/appointments", searchAppointments);
router.get("/medical-records", searchMedicalRecords);

module.exports = router;
