const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const { appointmentSchema, updateAppointmentSchema } = require('../validators/appointment.validator');
const { NotificationService } = require('../services/notification.service');

const createAppointment = async (req, res) => {
  try {
    await appointmentSchema.validate(req.body);

    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = new Appointment({
      ...req.body,
      patientId: req.user._id
    });
    await appointment.save();

    // Send notification
    await NotificationService.sendAppointmentNotification(
      appointment,
      'New appointment scheduled'
    );

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'doctor' 
      ? { doctorId: req.user._id }
      : { patientId: req.user._id };

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    await updateAppointmentSchema.validate(req.body);

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = req.body.status;
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();

    // Send notification
    await NotificationService.sendAppointmentNotification(
      appointment,
      `Appointment ${req.body.status}`
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
};