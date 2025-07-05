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
  bmi: yup.number().required('BMI is required'),
  smoking: yup.boolean().required('Smoking status is required'),
  alcoholDrinking: yup.boolean().required('Alcohol drinking status is required'),
  stroke: yup.boolean().required('Stroke status is required'),
  physicalHealth: yup.number().min(0).max(30).required('Physical health days are required'),
  mentalHealth: yup.number().min(0).max(30).required('Mental health days are required'),
  diffWalking: yup.boolean().required('Difficulty walking status is required'),
  ageCategory: yup.string().required('Age category is required'),
  race: yup.string().required('Race is required'),
  diabetic: yup.string().oneOf(['Yes', 'No', 'Borderline diabetes']).required('Diabetic status is required'),
  physicalActivity: yup.boolean().required('Physical activity status is required'),
  genHealth: yup.string().oneOf(['Excellent', 'Very good', 'Good', 'Fair', 'Poor']).required('General health is required'),
  sleepTime: yup.number().min(0).max(24).required('Sleep time is required'),
  asthma: yup.boolean().required('Asthma status is required'),
  kidneyDisease: yup.boolean().required('Kidney disease status is required'),
  skinCancer: yup.boolean().required('Skin cancer status is required'),
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