const yup = require('yup');
const { isValidTimeFormat } = require('../utils/time.util');

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
        .test('time-format', 'Invalid time format. Use format like "2:30 PM" or "14:30"', isValidTimeFormat)
        .required('Start time is required'),
      endTime: yup.string()
        .test('time-format', 'Invalid time format. Use format like "2:30 PM" or "14:30"', isValidTimeFormat)
        .required('End time is required')
    })
  )
});

const availabilitySchema = yup.object({
  availability: yup.array().of(
    yup.object({
      dayOfWeek: yup.string()
        .oneOf(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
        .required('Day is required'),
      startTime: yup.string()
        .test('time-format', 'Invalid time format. Use format like "2:30 PM" or "14:30"', isValidTimeFormat)
        .required('Start time is required'),
      endTime: yup.string()
        .test('time-format', 'Invalid time format. Use format like "2:30 PM" or "14:30"', isValidTimeFormat)
        .required('End time is required')
    })
  ).required('Availability is required')
});

module.exports = {
  doctorSchema,
  availabilitySchema
};