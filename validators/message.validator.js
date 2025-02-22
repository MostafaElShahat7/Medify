const yup = require('yup');

const messageSchema = yup.object({
  receiverId: yup.string()
    .required('Receiver ID is required'),
  content: yup.string()
    .required('Message content is required')
    .max(1000, 'Message content cannot exceed 1000 characters')
});

module.exports = {
  messageSchema
};