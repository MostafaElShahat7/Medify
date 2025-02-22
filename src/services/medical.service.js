const prisma = require('../config/prisma');

class MedicalService {
  static async createMedicalReport(reportData, attachments = []) {
    return prisma.medicalReport.create({
      data: {
        ...reportData,
        attachments: {
          create: attachments
        }
      },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true
          }
        },
        attachments: true
      }
    });
  }

  static async createPrescription(prescriptionData) {
    return prisma.prescription.create({
      data: {
        ...prescriptionData,
        medications: {
          create: prescriptionData.medications
        }
      },
      include: {
        medications: true,
        medicalReport: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: true
              }
            }
          }
        }
      }
    });
  }

  static async findPatientMedicalHistory(patientId) {
    return prisma.medicalHistory.findMany({
      where: {
        patient: {
          userId: patientId
        }
      },
      include: {
        medications: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

module.exports = MedicalService;