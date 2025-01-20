
-- Create Enums
CREATE TYPE UserRole AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');
CREATE TYPE Gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE BloodType AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');
CREATE TYPE AppointmentStatus AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE PrescriptionStatus AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE WeekDay AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role UserRole NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- PatientProfile Table
CREATE TABLE PatientProfile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID UNIQUE NOT NULL REFERENCES Users(id),
    dateOfBirth DATE NOT NULL,
    gender Gender NOT NULL,
    bloodType BloodType,
    allergies TEXT[],
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- DoctorProfile Table
CREATE TABLE DoctorProfile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID UNIQUE NOT NULL REFERENCES Users(id),
    specialization VARCHAR(255) NOT NULL,
    experienceYears INT NOT NULL,
    rating FLOAT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Appointment Table
CREATE TABLE Appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patientId UUID NOT NULL REFERENCES Users(id),
    doctorId UUID NOT NULL REFERENCES Users(id),
    appointmentDate TIMESTAMP NOT NULL,
    status AppointmentStatus DEFAULT 'SCHEDULED',
    reason TEXT NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- MedicalReport Table
CREATE TABLE MedicalReports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointmentId UUID UNIQUE NOT NULL REFERENCES Appointments(id),
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    notes TEXT,
    recommendations TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Prescription Table
CREATE TABLE Prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reportId UUID NOT NULL REFERENCES MedicalReports(id),
    status PrescriptionStatus DEFAULT 'ACTIVE',
    notes TEXT,
    validUntil TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Message Table
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senderId UUID NOT NULL REFERENCES Users(id),
    receiverId UUID NOT NULL REFERENCES Users(id),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- MedicalHistory Table
CREATE TABLE MedicalHistories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patientId UUID NOT NULL REFERENCES PatientProfile(id),
    condition TEXT NOT NULL,
    diagnosedDate TIMESTAMP,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Medication Table
CREATE TABLE Medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    duration VARCHAR(255),
    instructions TEXT,
    prescriptionId UUID REFERENCES Prescriptions(id),
    medicalHistoryId UUID REFERENCES MedicalHistories(id)
);

-- Attachment Table
CREATE TABLE Attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    uploadedAt TIMESTAMP DEFAULT NOW(),
    messageId UUID REFERENCES Messages(id),
    reportId UUID REFERENCES MedicalReports(id)
);

-- EmergencyContact Table
CREATE TABLE EmergencyContacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patientId UUID UNIQUE NOT NULL REFERENCES PatientProfile(id),
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(255),
    phone VARCHAR(15) NOT NULL
);

-- Availability Table
CREATE TABLE Availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctorId UUID NOT NULL REFERENCES DoctorProfile(id),
    day WeekDay NOT NULL,
    startTime VARCHAR(255) NOT NULL,
    endTime VARCHAR(255) NOT NULL,
    UNIQUE(doctorId, day)
);
