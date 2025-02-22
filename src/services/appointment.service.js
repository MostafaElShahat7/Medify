const prisma = require('../config/prisma');

class AppointmentService {
  static async createAppointment(appointmentData) {
    return prisma.appointment.create({
      data: appointmentData,
      include: {
        doctor: true,
        patient: true
      }
    });
  }

  static async findUserAppointments(userId, role) {
    const where = role === 'DOCTOR' 
      ? { doctorId: userId }
      : { patientId: userId };

    return prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            name: true,
            doctorProfile: {
              select: {
                specialization: true
              }
            }
          }
        },
        patient: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });
  }

  static async updateAppointment(id, data) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        doctor: true,
        patient: true
      }
    });
  }
}

module.exports = AppointmentService;