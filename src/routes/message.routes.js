const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount
} = require('../controllers/message.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// All routes require authentication
router.use(authenticate);

// Message routes
router.post('/', upload.array('attachments'), sendMessage);
router.get('/conversations', getConversations);
router.get('/unread', getUnreadCount);
router.get('/:userId', getMessages);

module.exports = router;