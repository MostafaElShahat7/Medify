const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING'
  },
  reason: {
    type: String,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);