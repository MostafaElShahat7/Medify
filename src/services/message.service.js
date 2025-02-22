const prisma = require('../config/prisma');

class MessageService {
  static async sendMessage(messageData, attachments = []) {
    return prisma.message.create({
      data: {
        ...messageData,
        attachments: {
          create: attachments
        }
      },
      include: {
        sender: {
          select: {
            name: true
          }
        },
        receiver: {
          select: {
            name: true
          }
        },
        attachments: true
      }
    });
  }

  static async getConversations(userId) {
    const messages = await prisma.message.groupBy({
      by: ['senderId', 'receiverId'],
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      _count: true,
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: {
            select: {
              name: true
            }
          },
          receiver: {
            select: {
              name: true
            }
          }
        }
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: otherId,
          receiverId: userId,
          read: false
        }
      });

      conversations.push({
        otherUser: lastMessage.sender.id === userId ? lastMessage.receiver : lastMessage.sender,
        lastMessage,
        unreadCount
      });
    }

    return conversations;
  }

  static async markAsRead(messageIds) {
    return prisma.message.updateMany({
      where: {
        id: {
          in: messageIds
        }
      },
      data: {
        read: true
      }
    });
  }
}

module.exports = MessageService;