const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const appointmentRoutes = require('./appointment.routes');
const medicalRecordsRoutes = require('./medical-records.routes');
const messageRoutes = require('./message.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Auth routes
router.use('/auth', authRoutes);

// Appointment routes
router.use('/appointments', appointmentRoutes);

// Medical records routes
router.use('/medical-records', medicalRecordsRoutes);

// Message routes
router.use('/messages', messageRoutes);

// Patient routes
router.use('/patients', patientRoutes);

// Doctor routes
router.use('/doctors', doctorRoutes);

module.exports = router;