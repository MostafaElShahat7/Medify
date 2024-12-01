const AIService = require('../services/ai.service');
const { catchAsync } = require('../utils/error.util');

const analyzePatientData = catchAsync(async (req, res) => {
  const analysis = await AIService.analyzePatientData(req.body);
  res.json({
    message: 'Patient data analyzed successfully',
    analysis
  });
});

const getHealthRecommendations = catchAsync(async (req, res) => {
  const recommendations = await AIService.getHealthRecommendations(req.user._id);
  res.json({
    message: 'Health recommendations retrieved successfully',
    recommendations
  });
});

const predictDiagnosis = catchAsync(async (req, res) => {
  const diagnosis = await AIService.predictDiagnosis(req.body.symptoms);
  res.json({
    message: 'Diagnosis prediction completed',
    diagnosis
  });
});

module.exports = {
  analyzePatientData,
  getHealthRecommendations,
  predictDiagnosis
};