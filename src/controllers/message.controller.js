const Message = require('../models/message.model');
// const User = require('../models/user.model');
const { messageSchema } = require('../validators/message.validator');
const { NotificationService } = require('../services/notification.service');

const sendMessage = async (req, res) => {
  try {
    await messageSchema.validate(req.body);

    // Check if receiver exists
    const receiver = await User.findById(req.body.receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      content: req.body.content,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype
      }))
    });

    await message.save();

    // Send notification
    await NotificationService.sendMessageNotification(message);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.id },
            { receiverId: req.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user.id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            role: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount
};