const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// Get total counts
router.get('/counts', authenticateAdmin, adminController.getCounts);

// Get private profile by ID (type: patient/doctor)
router.get('/profile/:type/:id', authenticateAdmin, adminController.getProfileById);

// Get own admin profile
router.get('/profile', authenticateAdmin, adminController.getOwnProfile);

// Delete any account by ID (type: patient/doctor/admin)
router.delete('/account/:type/:id', authenticateAdmin, adminController.deleteAccountById);

module.exports = router; 