const Message = require('../models/message.model');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const { messageSchema } = require('../validators/message.validator');
const { NotificationService } = require('../services/notification.service');
const mongoose = require('mongoose');

const sendMessage = async (req, res) => {
  try {
    await messageSchema.validate(req.body);
    const { receiverId, content } = req.body;

    // تحديد نوع المرسل (دكتور أم مريض)
    const senderModel = req.user.role === 'doctor' ? 'Doctor' : 'Patient';
    
    // البحث عن المستقبل في كلا الجدولين
    let receiver = await Doctor.findById(receiverId);
    let receiverModel = 'Doctor';
    
    if (!receiver) {
      receiver = await Patient.findById(receiverId);
      receiverModel = 'Patient';
      
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }
    }

    const message = new Message({
      senderId: req.user._doc._id,
      senderModel,
      receiverId,
      receiverModel,
      content,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype
      }))
    });

    await message.save();
    //هبقا اضيفها بعدين 
    // // إرسال إشعار
    // await NotificationService.sendPushNotification(
    //   receiverId,
    //   'New Message',
    //   `You have a new message from ${req.user._doc.name}`
    // );

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._doc._id;
    const userModel = req.user.role === 'doctor' ? 'Doctor' : 'Patient';

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { 
              senderId: new mongoose.Types.ObjectId(userId), 
              senderModel: userModel 
            },
            { 
              receiverId: new mongoose.Types.ObjectId(userId), 
              receiverModel: userModel 
            }
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
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              { id: '$receiverId', model: '$receiverModel' },
              { id: '$senderId', model: '$senderModel' }
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // إضافة معلومات المستخدم الآخر
    for (let conv of conversations) {
      const Model = mongoose.model(conv._id.model);
      const otherUser = await Model.findById(conv._id.id);
      if (otherUser) {
        conv.user = {
          _id: otherUser._id,
          name: otherUser.name,
          role: conv._id.model.toLowerCase()
        };
      }
    }

    res.json(conversations);
  } catch (error) {
    console.error('Get Conversations Error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._doc._id;
    const currentUserModel = req.user.role === 'doctor' ? 'Doctor' : 'Patient';

    const messages = await Message.find({
      $or: [
        { 
          senderId: currentUserId, 
          receiverId: userId,
          senderModel: currentUserModel
        },
        { 
          senderId: userId, 
          receiverId: currentUserId,
          receiverModel: currentUserModel
        }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // تحديث حالة القراءة
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        receiverModel: currentUserModel,
        read: false
      },
      { read: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._doc._id,
      receiverModel: req.user.role === 'doctor' ? 'Doctor' : 'Patient',
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount
};