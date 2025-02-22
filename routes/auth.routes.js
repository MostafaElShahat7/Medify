const express = require('express');
const router = express.Router();
const { register, login, resetPassword, requestPasswordReset } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/request-reset-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;