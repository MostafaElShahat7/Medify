const Patient = require("../models/patient.model");
const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctor.model');
const {
  patientSchema,
  medicalHistorySchema,
} = require("../validators/patient.validator");

const createPatientProfile = async (req, res) => {
  try {
    // Validate request body
    await patientSchema.validate(req.body);

    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Patient profile already exists" });
    }

    // Create patient profile
    const patient = new Patient({
      ...req.body,
      userId: req.user._id,
    });
    await patient.save();

    res.status(201).json({
      message: "Patient profile created successfully",
      patient,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPatientProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const patientId = decoded.id; 

    try {
        const patient = await Patient.findById(patientId).populate('userId'); 
        if (!patient) {
            return res.status(404).send("Patient not found.");
        }
        res.status(200).json(patient); 
    } catch (error) {
        res.status(500).send("Error retrieving profile: " + error.message);
    }
  };

const updatePatientProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); 
  const patientId = decoded.id; 

  
  const updatedData = req.body; 

  try {
      const result = await Patient.findByIdAndUpdate(patientId, updatedData, { new: true, runValidators: true }); // تحديث بيانات المريض
      if (!result) {
          return res.status(404).send("Patient not found.");
      }
      res.status(200).json({
        message: "Profile Updated successfully",
        data: result
      }); 
      // Send email notification
      const { sendEmail } = require('../utils/email.util');
      await sendEmail(result.email, 'Profile Updated', 'Your profile has been updated successfully.');
  } catch (error) {
      res.status(500).send("Error updating profile: " + error.message);
  }
};

const addMedicalHistory = async (req, res) => {
  try {
    await medicalHistorySchema.validate(req.body);

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    patient.medicalHistory.push(req.body);
    await patient.save();

    res.status(201).json({
      message: "Medical history added successfully",
      medicalHistory: patient.medicalHistory[patient.medicalHistory.length - 1],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select(
      "medicalHistory"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (patient.favoriteDoctors.includes(doctorId)) {
      return res.status(400).json({ message: 'Doctor already in favorites' });
    }

    patient.favoriteDoctors.push(doctorId);
    await patient.save();

    res.json({ 
      message: 'Doctor added to favorites',
      favoriteDoctors: patient.favoriteDoctors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id })
      .populate('favoriteDoctors', 'name specialization rating');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient.favoriteDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    patient.favoriteDoctors = patient.favoriteDoctors.filter(
      id => id.toString() !== doctorId
    );
    await patient.save();

    res.json({ 
      message: 'Doctor removed from favorites',
      favoriteDoctors: patient.favoriteDoctors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientProfileById = async (req, res) => {
  try {
    const { patientId } = req.params;
    // Exclude password field
    const patient = await Patient.findById(patientId).select('-password').populate('userId');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving patient profile: " + error.message });
  }
};

module.exports = {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  addMedicalHistory,
  getMedicalHistory,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  getPatientProfileById
};