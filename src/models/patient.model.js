const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
  },
  height: Number,
  weight: Number,
  chronicCondition: String,
  diabetes: {
    type: Boolean,
    default: false
  },
  heartRate: Number,
  bmi: Number,
  resetToken: String,
  medicalHistory: [{
    type: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    description: String,
    diagnosis: String,
    treatment: String,
    attachments: [String],
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    }
  }],
  favoriteDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
}, {
  timestamps: true
});

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);