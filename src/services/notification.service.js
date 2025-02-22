const admin = require("firebase-admin");
const prisma = require("../config/prisma");
const winston = require("winston");

class NotificationService {
  static async sendPushNotification(userId, title, body, data = {}) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true }
      });

      if (!user?.fcmToken) return;

      const message = {
        notification: {
          title,
          body
        },
        data,
        token: user.fcmToken
      };

      await admin.messaging().send(message);
      winston.info(`Push notification sent to user: ${userId}`);
    } catch (error) {
      winston.error("Error sending push notification:", error);
    }
  }

  static async sendAppointmentReminder(appointment) {
    // Send reminder 24 hours before appointment
    const reminderTime = new Date(appointment.dateTime);
    reminderTime.setHours(reminderTime.getHours() - 24);

    const now = new Date();
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();

      setTimeout(async () => {
        const formattedDate = appointment.dateTime.toLocaleDateString();
        const formattedTime = appointment.dateTime.toLocaleTimeString();

        await this.sendPushNotification(
          appointment.patientId,
          "Appointment Reminder",
          `You have an appointment tomorrow at ${formattedTime} on ${formattedDate}`
        );
      }, delay);
    }
  }

  // Send reminder 1 hour before appointment
  static async sendUpcomingAppointmentReminder(appointment) {
    const reminderTime = new Date(appointment.dateTime);
    reminderTime.setHours(reminderTime.getHours() - 1);

    const now = new Date();
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();

      setTimeout(async () => {
        await this.sendPushNotification(
          appointment.patientId,
          "Upcoming Appointment",
          `Your appointment is in 1 hour`
        );
      }, delay);
    }
  }
}

module.exports = NotificationService;
