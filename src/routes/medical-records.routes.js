const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createMedicalReport,
  getMedicalReports,
  createPrescription,
  getPrescriptions,
  updatePrescription
} = require('../controllers/medical-records.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/medical-reports');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// All routes require authentication
router.use(authenticate);

// Medical Reports routes (doctors only for creation)
router.post('/reports', authorize('doctor'), upload.array('attachments'), createMedicalReport);
router.get('/reports', authorize('doctor', 'patient'), getMedicalReports);

// Prescriptions routes
router.post('/prescriptions', authorize('doctor'), createPrescription);
router.get('/prescriptions', authorize('doctor', 'patient'), getPrescriptions);
router.patch('/prescriptions/:id', authorize('doctor'), updatePrescription);

module.exports = router;