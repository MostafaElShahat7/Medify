const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const { appointmentSchema, updateAppointmentSchema } = require('../validators/appointment.validator');
const NotificationService = require('../services/notification.service');
const Patient = require('../models/patient.model');


const createAppointment = async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;

    try {
        // تحقق من وجود الطبيب
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // تحقق من وجود المريض
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // تحقق من وجود موعد محجوز بالفعل في نفس الوقت
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time,
        });
        if (existingAppointment) {
          return res.status(400).json({ message: 'Appointment time is already booked' });
      }
      
    await appointment.save();

    // Send notification using the static method
    await NotificationService.sendPushNotification(
      doctor._id,
      'New Appointment',
      'A new appointment has been scheduled'
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
      ? { doctorId: req.user.id }
      : { patientId: req.user.id };

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
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = req.body.status;
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();

    // Send notification
    await NotificationService.sendPushNotification(
      appointment.patientId,
      'Appointment Update',
      `Your appointment has been ${req.body.status}`
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
