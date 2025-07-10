const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const MedicalReport = require('../models/medical-record.model');
const { catchAsync } = require('../utils/error.util');

const searchDoctors = catchAsync(async (req, res) => {
  try {
    const { specialization, rating, availability } = req.query;
    
    console.log('Search Query:', { specialization, rating, availability });
    
    const query = {};
    
    // Build search query
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    if (availability) {
      query['availability.dayOfWeek'] = availability.toUpperCase();
    }

    console.log('MongoDB Query:', query);

    const doctors = await Doctor.find(query)
      .select('name specialization rating clinicName clinicAddress experienceYears profilePicture')
      .sort({ rating: -1 });

    if (!doctors || doctors.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No doctors found matching your criteria',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Search Doctors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for doctors',
      error: error.message,
      debug: { query: req.query }
    });
  }
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
  try {
    const { diagnosis, startDate, endDate, type } = req.query;
    
    console.log('Search Medical Records Query:', { diagnosis, startDate, endDate, type });
    
    const query = {};

    // Set user-specific query based on role
    const userData = req.user._doc || req.user;
    if (!userData || !userData._id) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Add role-based filters
    if (userData.role === 'patient') {
      query.patientId = userData._id;
    } else if (userData.role === 'doctor') {
      query.doctorId = userData._id;
    }

    // Add search filters
    if (diagnosis) {
      query.diagnosis = new RegExp(diagnosis, 'i');
    }
    if (type) {
      query.type = type;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    console.log('MongoDB Query:', query);

    const records = await MedicalReport.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ date: -1 });

    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No medical records found matching your criteria',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
      filters: {
        diagnosis: diagnosis || 'all',
        type: type || 'all',
        dateRange: {
          from: startDate || 'any',
          to: endDate || 'any'
        }
      }
    });
  } catch (error) {
    console.error('Search Medical Records Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medical records',
      error: error.message,
      debug: { 
        query: req.query,
        userId: req.user?._doc?._id,
        role: req.user?.role
      }
    });
  }
});

module.exports = {
  searchDoctors,
  searchAppointments,
  searchMedicalRecords
};