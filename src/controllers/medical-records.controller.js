const MedicalReport = require("../models/medical-record.model");
const Prescription = require("../models/prescription.model");
const {
  medicalReportSchema,
  prescriptionSchema,
  updatePrescriptionSchema,
} = require("../validators/medical-records.validator");
const { NotificationService } = require("../services/notification.service");
const Patient = require("../models/patient.model");

// Medical Reports Controllers
const createMedicalReport = async (req, res) => {
  try {
    // Get user data from _doc
    const userData = req.user._doc || req.user;

    if (!userData || !userData._id) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
        debug: { userData },
      });
    }

    const doctorId = userData._id.toString();

    // Verify patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
        debug: { patientId: req.body.patientId }
      });
    }

    // Parse symptoms if they're received as a string
    if (typeof req.body.symptoms === "string") {
      req.body.symptoms = req.body.symptoms
        .replace(/[\[\]]/g, "") // Remove square brackets
        .split(",") // Split by comma
        .map((symptom) => symptom.trim()); // Trim whitespace
    }

    // تعيين نوع افتراضي صحيح من القيم المسموح بها
    if (!req.body.type) {
      req.body.type = "checkup";
    }

    const reportData = {
      ...req.body,
      doctorId: doctorId,
      patientId: req.body.patientId, // Make sure patientId is explicitly set
      date: new Date(),
      attachments:
        req.files?.map((file) => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
        })) || [],
    };

    // Log the data before validation
    console.log("Report Data:", reportData);

    await medicalReportSchema.validate(reportData);

    const report = new MedicalReport(reportData);
    await report.save();

    // Populate with explicit select fields
    const populatedReport = await MedicalReport.findById(report._id)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email");

    res.status(201).json({
      message: "Medical report created successfully",
      report: populatedReport,
    });
  } catch (error) {
    console.error("Error creating medical report:", {
      error,
      requestBody: req.body,
      patientId: req.body.patientId
    });
    res.status(400).json({
      message: error.message,
      errors: error.errors || [],
      debug: { 
        userInfo: req.user ? "exists" : "missing",
        patientId: req.body.patientId
      },
    });
  }
};

const getMedicalReports = async (req, res) => {
  try {
    const userData = req.user._doc || req.user;

    console.log("User Data:", {
      id: userData._id,
      role: userData.role,
      isDoctor: userData.specialization ? true : false,
    });

    if (!userData || !userData._id) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    // تحديد نوع المستخدم والاستعلام المناسب
    const isDoctor = userData.specialization ? true : false;
    const query = isDoctor
      ? { doctorId: userData._id }
      : { patientId: userData._id };

    const reports = await MedicalReport.find(query)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
      debug: {
        userId: userData._id,
        role: userData.role,
        isDoctor: isDoctor,
        query: query,
      },
    });
  } catch (error) {
    console.error("Get medical reports error:", error);
    res.status(500).json({
      message: "Error fetching medical reports",
      error: error.message,
    });
  }
};

// Prescriptions Controllers
const createPrescription = async (req, res) => {
  try {
    const userData = req.user._doc || req.user;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const prescriptionData = {
      ...req.body,
      doctorId: userData._id,
      status: "active",
      validUntil: req.body.validUntil || validUntil,
    };

    await prescriptionSchema.validate(prescriptionData);
    const prescription = new Prescription(prescriptionData);
    await prescription.save();

    // تعديل شكل الـ response
    const response = {
      message: "Prescription created successfully",
      data: {
        prescriptionId: prescription._id.toString(), // تحويل الـ ID لـ string
        prescription: prescription,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const userData = req.user._doc || req.user;

    console.log("User Data:", {
      id: userData._id,
      role: userData.role,
      isDoctor: userData.specialization ? true : false, // Add specialization check
    });

    if (!userData || !userData._id) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    // Check if user is doctor by checking specialization
    const isDoctor = userData.specialization ? true : false;
    const query = isDoctor
      ? { doctorId: userData._id }
      : { patientId: userData._id };

    console.log("Query:", query);

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
      debug: {
        userId: userData._id,
        role: userData.role,
        isDoctor: isDoctor,
        query: query,
      },
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const userData = req.user._doc || req.user;

    if (!userData || !userData._id) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    await updatePrescriptionSchema.validate(req.body);

    // تنظيف الـ ID من المسافات الزائدة
    const prescriptionId = req.params.id.trim();

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
        debug: { id: prescriptionId },
      });
    }

    // Only the issuing doctor can update the prescription
    if (prescription.doctorId.toString() !== userData._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    prescription.status = req.body.status;
    if (req.body.notes) prescription.notes = req.body.notes;
    await prescription.save();

    res.json({
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", {
      error,
      prescriptionId: req.params.id,
      trimmedId: req.params.id?.trim(),
    });
    res.status(400).json({
      message: error.message,
      debug: { id: req.params.id },
    });
  }
};

module.exports = {
  createMedicalReport,
  getMedicalReports,
  createPrescription,
  getPrescriptions,
  updatePrescription,
};
