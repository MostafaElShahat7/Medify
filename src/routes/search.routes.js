const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  searchDoctors,
  searchAppointments,
  searchMedicalRecords
} = require('../controllers/search.controller');

router.use(authenticate);

router.get('/doctors', searchDoctors);
router.get('/appointments', searchAppointments);
router.get('/medical-records', searchMedicalRecords);

module.exports = router;