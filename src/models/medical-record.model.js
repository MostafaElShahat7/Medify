const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptoms: [
      {
        type: String,
        required: true,
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ["checkup", "follow-up", "emergency", "consultation"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    treatment: String,
    notes: String,
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema, "medicalrecords");
