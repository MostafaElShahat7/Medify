const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
    trim: true
  },
  diagnosedDate: Date,
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  notes: String
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medicalHistory: [medicalHistorySchema],
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: String,
    phone: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);