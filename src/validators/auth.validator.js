const yup = require('yup');

const registerSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .trim(),
  email: yup.string()
    .email('Invalid email')
    .required('Email is required')
    .trim()
    .lowercase(),
    unique: true(),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
    username: {
      type: String,
      required: true,
      unique: true 
  },
  role: yup.string()
    .oneOf(['admin', 'doctor', 'patient'], 'Invalid role')
    .required('Role is required'),
  phone: yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number')
    .when('role', {
      is: 'doctor',
      then: (schema) => schema.required('Phone number is required for doctors'),
      otherwise: (schema) => schema.notRequired()
    }),
});

const loginSchema = yup.object({
  email: yup.string()
    .email('Invalid email')
    .required('Email is required')
    .trim()
    .lowercase(),
  password: yup.string()
    .required('Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
};