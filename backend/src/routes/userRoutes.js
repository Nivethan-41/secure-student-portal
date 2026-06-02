const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

// Protect the route using requireAuth middleware
router.get('/logs', requireAuth, userController.getSecurityLogs);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/change-password', requireAuth, userController.changePassword);

module.exports = router;
