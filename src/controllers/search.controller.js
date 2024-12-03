const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const MedicalReport = require('../models/medical-report.model');
const { catchAsync } = require('../utils/error.util');

const searchDoctors = catchAsync(async (req, res) => {
  const { specialization, rating, availability } = req.query;
  
  const query = {};
  if (specialization) {
    query.specialization = new RegExp(specialization, 'i');
  }
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }
  if (availability) {
    query['availability.day'] = availability.toLowerCase();
  }

  const doctors = await Doctor.find(query)
    .populate('userId', 'name email')
    .sort({ rating: -1 });

  res.json(doctors);
});

const searchAppointments = catchAsync(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  
  const query = {};
  if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctorId = req.user._id;
  }

  if (status) {
    query.status = status;
  }
  if (startDate || endDate) {
    query.appointmentDate = {};
    if (startDate) query.appointmentDate.$gte = new Date(startDate);
    if (endDate) query.appointmentDate.$lte = new Date(endDate);
  }

  const appointments = await Appointment.find(query)
    .populate('doctorId', 'name')
    .populate('patientId', 'name')
    .sort({ appointmentDate: -1 });

  res.json(appointments);
});

const searchMedicalRecords = catchAsync(async (req, res) => {
  const { diagnosis, startDate, endDate } = req.query;
  
  const query = {};
  if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctorId = req.user._id;
  }

  if (diagnosis) {
    query.diagnosis = new RegExp(diagnosis, 'i');
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const records = await MedicalReport.find(query)
    .populate('doctorId', 'name')
    .populate('patientId', 'name')
    .sort({ createdAt: -1 });

  res.json(records);
});

module.exports = {
  searchDoctors,
  searchAppointments,
  searchMedicalRecords
};