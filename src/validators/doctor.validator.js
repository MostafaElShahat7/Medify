const yup = require('yup');

const doctorSchema = yup.object({
  specialization: yup.string(),
    // .required('Specialization is required'),
  experienceYears: yup.number()
    .min(0, 'Experience years must be positive'),
    // .required('Experience years is required'),
  availability: yup.array().of(
    yup.object({
      day: yup.string()
        .oneOf(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .required('Day is required'),
      startTime: yup.string()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .required('Start time is required'),
      endTime: yup.string()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .required('End time is required')
    })
  )
});

const availabilitySchema = yup.object({
  availability: yup.array().of(
    yup.object({
      day: yup.string()
        .oneOf(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .required('Day is required'),
      startTime: yup.string()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .required('Start time is required'),
      endTime: yup.string()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .required('End time is required')
    })
  ).required('Availability is required')
});

module.exports = {
  doctorSchema,
  availabilitySchema
};