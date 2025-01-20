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
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  role: yup.string()
    .oneOf(['admin', 'doctor', 'patient'], 'Invalid role')
    .required('Role is required')
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