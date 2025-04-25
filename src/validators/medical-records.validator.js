const yup = require('yup');

const medicalReportSchema = yup.object({
  patientId: yup.string().required('Patient ID is required'),
  appointmentId: yup.string(),
  diagnosis: yup.string().required('Diagnosis is required'),
  symptoms: yup.array().of(yup.string()).min(1, 'At least one symptom is required'),
  type: yup.string()
    .oneOf(['checkup', 'follow-up', 'emergency', 'consultation'], 'Invalid report type')
    .required('Report type is required'),
  treatment: yup.string().required('Treatment is required'),
  notes: yup.string(),
  recommendations: yup.string()
});

const prescriptionSchema = yup.object({
  reportId: yup.string(),
  medications: yup.array().of(
    yup.object({
      name: yup.string().required('Medication name is required'),
      dosage: yup.string().required('Dosage is required'),
      frequency: yup.string().required('Frequency is required'),
      duration: yup.string().required('Duration is required'),
      instructions: yup.string()
    })
  ).min(1, 'At least one medication is required'),
  notes: yup.string(),
  validUntil: yup.date()
    .min(new Date(), 'Valid until date must be in the future')
    .required('Valid until date is required')
});

const updatePrescriptionSchema = yup.object({
  status: yup.string()
    .oneOf(['active', 'completed', 'cancelled'])
    .required('Status is required'),
  notes: yup.string()
});

module.exports = {
  medicalReportSchema,
  prescriptionSchema,
  updatePrescriptionSchema
};