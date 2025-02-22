const yup = require('yup');

const appointmentSchema = yup.object({
  doctorId: yup.string().required('Doctor ID is required'),
  appointmentDate: yup.date()
    .min(new Date(), 'Appointment date must be in the future')
    .required('Appointment date is required'),
  reason: yup.string().required('Reason for appointment is required'),
  notes: yup.string()
});

const updateAppointmentSchema = yup.object({
  status: yup.string()
    .oneOf(['scheduled', 'completed', 'cancelled'])
    .required('Status is required'),
  notes: yup.string()
});

module.exports = {
  appointmentSchema,
  updateAppointmentSchema
};