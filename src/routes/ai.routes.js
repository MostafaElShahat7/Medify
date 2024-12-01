const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  analyzePatientData,
  getHealthRecommendations,
  predictDiagnosis
} = require('../controllers/ai.controller');

// All routes require authentication
router.use(authenticate);

// AI analysis routes (doctors only)
router.post('/analyze', authorize('doctor'), analyzePatientData);

// Health recommendations (patients and doctors)
router.get('/recommendations', authorize('patient', 'doctor'), getHealthRecommendations);

// Diagnosis prediction (doctors only)
router.post('/predict-diagnosis', authorize('doctor'), predictDiagnosis);

module.exports = router;