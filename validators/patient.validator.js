const yup = require('yup');

const patientSchema = yup.object({
  dateOfBirth: yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: yup.string()
    .oneOf(['male', 'female', 'other'])
    .required('Gender is required'),
  bloodType: yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  allergies: yup.array().of(yup.string()),
  // emergencyContact: yup.object({
  //   name: yup.string()
  //   .required('Emergency contact name is required'),
  //   relationship: yup.string(),
  //   phone: yup.string()
  //     .matches(/^\+?[\d\s-]+$/, 'Invalid phone number')
  //     .required('Emergency contact phone is required')
  // }).required('Emergency contact information is required')
});

const medicalHistorySchema = yup.object({
  condition: yup.string().required('Condition is required'),
  diagnosedDate: yup.date(),
  medications: yup.array().of(
    yup.object({
      name: yup.string().required('Medication name is required'),
      dosage: yup.string().required('Dosage is required'),
      frequency: yup.string().required('Frequency is required')
    })
  ),
  notes: yup.string()
});

module.exports = {
  patientSchema,
  medicalHistorySchema
};