const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('../models/patient.model');

async function updatePatientsWithDefaults() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const defaultValues = {
      bmi: 22,
      smoking: false,
      alcoholDrinking: false,
      stroke: false,
      physicalHealth: 15,
      mentalHealth: 15,
      diffWalking: false,
      ageCategory: 'adult',
      race: 'other',
      diabetic: 'No',
      physicalActivity: false,
      genHealth: 'Good',
      sleepTime: 8,
      asthma: false,
      kidneyDisease: false,
      skinCancer: false
    };

    const patients = await Patient.find({});
    let updatedCount = 0;
    for (let patient of patients) {
      let updated = false;
      for (let key in defaultValues) {
        if (patient[key] === undefined) {
          patient[key] = defaultValues[key];
          updated = true;
        }
      }
      if (updated) {
        await patient.save();
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} patient(s) with default values.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating patients:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updatePatientsWithDefaults();
} 