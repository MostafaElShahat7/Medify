const axios = require('axios');
const { AppError } = require('../utils/error.util');

class AIService {
  static async analyzePatientData(patientData) {
    try {
      const response = await axios.post(
        process.env.AI_SERVICE_URL + '/analyze',
        patientData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new AppError('Failed to analyze patient data', 500);
    }
  }

  static async getHealthRecommendations(patientId) {
    try {
      const response = await axios.get(
        `${process.env.AI_SERVICE_URL}/recommendations/${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new AppError('Failed to get health recommendations', 500);
    }
  }

  static async predictDiagnosis(symptoms) {
    try {
      const response = await axios.post(
        process.env.AI_SERVICE_URL + '/predict-diagnosis',
        { symptoms },
        {
          headers: {
            'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new AppError('Failed to predict diagnosis', 500);
    }
  }
}

module.exports = AIService;