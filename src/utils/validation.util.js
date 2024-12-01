const yup = require('yup');

const handleValidation = async (schema, data) => {
  try {
    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    throw { status: 400, errors };
  }
};

module.exports = {
  handleValidation
};