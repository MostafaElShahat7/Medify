const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const Admin = require('../models/admin.model');

// 1. Get total counts (users, patients, doctors)
exports.getCounts = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalUsers = totalPatients + totalDoctors + totalAdmins;
    res.json({
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAdmins
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching counts', error });
  }
};

// 2. Get private profile by ID (patient or doctor)
exports.getProfileById = async (req, res) => {
  try {
    const { id, type } = req.params; // type: 'patient' or 'doctor'
    let user;
    if (type === 'patient') {
      user = await Patient.findById(id);
    } else if (type === 'doctor') {
      user = await Doctor.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// 3. Delete any account by ID (patient, doctor, or admin)
exports.deleteAccountById = async (req, res) => {
  try {
    const { id, type } = req.params; // type: 'patient', 'doctor', or 'admin'
    let Model;
    if (type === 'patient') Model = Patient;
    else if (type === 'doctor') Model = Doctor;
    else if (type === 'admin') Model = Admin;
    else return res.status(400).json({ message: 'Invalid type' });
    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
  }
}; 