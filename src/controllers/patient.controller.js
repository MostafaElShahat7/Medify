const Patient = require('../models/patient.model');
const { patientSchema, medicalHistorySchema } = require('../validators/patient.validator');

const createPatientProfile = async (req, res) => {
  try {
    // Validate request body
    await patientSchema.validate(req.body);

    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Patient profile already exists' });
    }

    // Create patient profile
    const patient = new Patient({
      ...req.body,
      userId: req.user._id
    });
    await patient.save();

    res.status(201).json({
      message: 'Patient profile created successfully',
      patient
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    await patientSchema.validate(req.body);

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    Object.assign(patient, req.body);
    await patient.save();

    res.json({
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addMedicalHistory = async (req, res) => {
  try {
    await medicalHistorySchema.validate(req.body);

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    patient.medicalHistory.push(req.body);
    await patient.save();

    res.status(201).json({
      message: 'Medical history added successfully',
      medicalHistory: patient.medicalHistory[patient.medicalHistory.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .select('medicalHistory');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  addMedicalHistory,
  getMedicalHistory
};