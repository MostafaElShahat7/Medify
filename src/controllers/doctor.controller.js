const Doctor = require('../models/doctor.model');
const { doctorSchema, availabilitySchema } = require('../validators/doctor.validator');
const { catchAsync } = require('../utils/error.util');

const createDoctorProfile = catchAsync(async (req, res) => {
  await doctorSchema.validate(req.body);

  const existingProfile = await Doctor.findOne({ userId: req.user._id });
  if (existingProfile) {
    return res.status(400).json({ message: 'Doctor profile already exists' });
  }

  const doctor = new Doctor({
    ...req.body,
    userId: req.user._id
  });
  await doctor.save();

  res.status(201).json({
    message: 'Doctor profile created successfully',
    doctor
  });
});

const getDoctorProfile = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id })
    .populate('userId', 'name email');

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  res.json(doctor);
});

const updateDoctorProfile = catchAsync(async (req, res) => {
  await doctorSchema.validate(req.body);

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  Object.assign(doctor, req.body);
  await doctor.save();

  res.json({
    message: 'Doctor profile updated successfully',
    doctor
  });
});

const getDoctorAvailability = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id })
    .select('availability');

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  res.json(doctor.availability);
});

const updateAvailability = catchAsync(async (req, res) => {
  await availabilitySchema.validate(req.body);

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  doctor.availability = req.body.availability;
  await doctor.save();

  res.json({
    message: 'Availability updated successfully',
    availability: doctor.availability
  });
});

const getDoctorPatients = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.user._id })
    .populate('patientId', 'name')
    .distinct('patientId');

  res.json(appointments);
});

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  updateAvailability,
  getDoctorPatients
};