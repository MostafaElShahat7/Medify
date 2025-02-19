const MedicalReport = require('../models/medical-record.model');
const Prescription = require('../models/prescription.model');
const { medicalReportSchema, prescriptionSchema, updatePrescriptionSchema } = require('../validators/medical-records.validator');
const { NotificationService } = require('../services/notification.service');

// Medical Reports Controllers
const createMedicalReport = async (req, res) => {
  try {
    await medicalReportSchema.validate(req.body);

    const report = new MedicalReport({
      ...req.body,
      doctorId: req.user._id,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype
      }))
    });

    await report.save();

    // Send notification
    await NotificationService.sendMedicalReportNotification(
      report,
      'New medical report available'
    );

    res.status(201).json({
      message: 'Medical report created successfully',
      report
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMedicalReports = async (req, res) => {
  try {
    const query = req.user.role === 'doctor'
      ? { doctorId: req.user.id }
      : { patientId: req.user._id };

    const reports = await MedicalReport.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Prescriptions Controllers
const createPrescription = async (req, res) => {
  try {
    await prescriptionSchema.validate(req.body);

    const prescription = new Prescription({
      ...req.body,
      doctorId: req.user.id,
      status: 'active'
    });

    await prescription.save();

    // Send notification
    await NotificationService.sendPrescriptionNotification(
      prescription,
      'New prescription issued'
    );

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const query = req.user.role === 'doctor'
      ? { doctorId: req.user.id }
      : { patientId: req.user.id };

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePrescription = async (req, res) => {
  try {
    await updatePrescriptionSchema.validate(req.body);

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only the issuing doctor can update the prescription
    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    prescription.status = req.body.status;
    if (req.body.notes) prescription.notes = req.body.notes;
    await prescription.save();

    // Send notification
    await NotificationService.sendPrescriptionNotification(
      prescription,
      `Prescription ${req.body.status}`
    );

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMedicalReport,
  getMedicalReports,
  createPrescription,
  getPrescriptions,
  updatePrescription
};