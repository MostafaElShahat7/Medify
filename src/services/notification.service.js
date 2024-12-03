const admin = require('firebase-admin');
const prisma = require('../config/prisma');
const winston = require('winston');

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
      winston.error('Error sending push notification:', error);
    }
  }

  static async sendAppointmentReminder(appointment) {
    const reminderTime = new Date(appointment.appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

    const now = new Date();
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(async () => {
        await this.sendPushNotification(
          appointment.patientId,
          'Appointment Reminder',
          `You have an appointment tomorrow at ${appointment.appointmentDate.toLocaleTimeString()}`
        );
      }, delay);
    }
  }

  static async sendMedicationReminder(prescription) {
    const medications = prescription.medications;
    const patient = await prisma.user.findUnique({
      where: { id: prescription.patientId }
    });

    medications.forEach(medication => {
      // Parse frequency to set up reminders
      const frequency = this.parseFrequency(medication.frequency);
      const endDate = new Date(prescription.validUntil);
      
      this.scheduleMedicationReminders(
        patient.id,
        medication.name,
        frequency,
        endDate
      );
    });
  }

  static parseFrequency(frequency) {
    // Convert frequency string to hours
    // e.g., "every 8 hours" => 8
    const match = frequency.match(/\d+/);
    return match ? parseInt(match[0]) : 24;
  }

  static scheduleMedicationReminders(userId, medicationName, frequencyHours, endDate) {
    const now = new Date();
    let nextReminder = new Date();
    nextReminder.setHours(nextReminder.getHours() + frequencyHours);

    while (nextReminder <= endDate) {
      const delay = nextReminder.getTime() - now.getTime();
      
      setTimeout(async () => {
        await this.sendPushNotification(
          userId,
          'Medication Reminder',
          `Time to take your ${medicationName}`
        );
      }, delay);

      nextReminder.setHours(nextReminder.getHours() + frequencyHours);
    }
  }
}

module.exports = NotificationService;