const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recommendations: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);