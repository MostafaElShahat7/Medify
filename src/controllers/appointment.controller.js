const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const { appointmentSchema, updateAppointmentSchema } = require('../validators/appointment.validator');
const NotificationService = require('../services/notification.service');
const Patient = require('../models/patient.model');


const createAppointment = async (req, res) => {
  const { doctorId, date, time, reason } = req.body;
  const patientId = req.user._doc._id; 
  console.log('Patient ID:', patientId);
  console.log('User Object:', req.user);
    try {
        // تحقق من وجود الطبيب
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // تحقق من وجود المريض
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // التحقق من أن التاريخ في المستقبل
        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (appointmentDateTime < now) {
          return res.status(400).json({ 
            message: 'Appointment date and time must be in the future' 
          });
        }

         // التحقق من availability الدكتور
         const dayOfWeek = appointmentDateTime.toLocaleString('en-US', { weekday: 'long' })
         .toUpperCase();
       console.log('Day of week:', dayOfWeek); // للتحقق من اليوم
        const availableSlot = doctor.availability.find(slot => 
          slot.dayOfWeek === dayOfWeek && 
          !slot.isBooked &&
          isTimeWithinRange(time, slot.startTime, slot.endTime)
        );

        if (!availableSlot) {
          return res.status(400).json({ 
            message: 'Doctor is not available at this time' 
          });
        }

        // تحقق من وجود موعد محجوز بالفعل في نفس الوقت
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time,
        });
        if (existingAppointment) {
          return res.status(400).json({ message: 'Appointment time is already booked' });
        }
      
        const appointment = new Appointment({
          doctorId,
          patientId,
          date,
          time,
          reason
        });
      
        await appointment.save();

        // تحديث حالة الـ availability
        availableSlot.isBooked = true;
        await doctor.save();

        // Send notification using the static method
        await NotificationService.sendPushNotification(
          doctor._id,
          'New Appointment',
          'A new appointment has been scheduled'
        );

        res.status(201).json({
          message: 'Appointment scheduled successfully',
          appointment
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// دالة مساعدة للتحقق من أن الوقت يقع ضمن النطاق المتاح
const isTimeWithinRange = (time, startTime, endTime) => {
  const convertToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const timeInMinutes = convertToMinutes(time);
  const startInMinutes = convertToMinutes(startTime);
  const endInMinutes = convertToMinutes(endTime);

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
};

const getAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'doctor' 
    ? { doctorId: req.user._doc._id }  // للدكتور
    : { patientId: req.user._doc._id }; // للمريض

    console.log('Query:', query); // للتحقق من القيم
    console.log('User Role:', req.user.role);
    console.log('User ID:', req.user._doc._id);

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ date: 1 });

      console.log('Found Appointments:', appointments); // للتحقق من النتائج
    
      res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    // تحقق من وجود البيانات المطلوبة
    if (!req.body.status) {
      return res.status(400).json({ 
        message: 'Status is required' 
      });
    }

    // تحويل status إلى حروف كبيرة
    req.body.status = req.body.status.toUpperCase();
    
    await updateAppointmentSchema.validate(req.body);
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // التحقق من الصلاحيات
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._doc._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // التحقق من أن الموعد الملغي لا يمكن تحديثه
    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ 
        message: 'Cannot update a cancelled appointment' 
      });
    }

    // التحقق من أن الموعد المكتمل لا يمكن تحديثه إلا بالملاحظات
    if (appointment.status === 'COMPLETED' && (req.body.date || req.body.time || req.body.status === 'CANCELLED')) {
      return res.status(400).json({ 
        message: 'Completed appointments can only be updated with notes' 
      });
    }

    // تحديث حالة الموعد
    if (req.body.status) {
      appointment.status = req.body.status; // الآن status بالفعل بحروف كبيرة

      // إذا تم إلغاء الموعد
      if (appointment.status === 'CANCELLED') {
        const doctor = await Doctor.findById(appointment.doctorId);
        const appointmentDate = new Date(appointment.date);
        const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
        
        const slot = doctor.availability.find(s => 
          s.dayOfWeek === dayOfWeek && 
          s.isBooked === true
        );
        
        if (slot) {
          slot.isBooked = false;
          await doctor.save();
        }
      }
    }

    // تحديث التاريخ والوقت
    if (req.body.date || req.body.time) {
      const newDateTime = new Date(`${req.body.date || appointment.date}T${req.body.time || appointment.time}`);
      const now = new Date();

      if (newDateTime < now) {
        return res.status(400).json({ 
          message: 'New appointment date and time must be in the future' 
        });
      }

      const doctor = await Doctor.findById(appointment.doctorId);
      const dayOfWeek = newDateTime.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
      
      const availableSlot = doctor.availability.find(slot => 
        slot.dayOfWeek === dayOfWeek && 
        (!slot.isBooked || slot.isBooked === appointment._id.toString()) &&
        isTimeWithinRange(req.body.time || appointment.time, slot.startTime, slot.endTime)
      );

      if (!availableSlot) {
        return res.status(400).json({ 
          message: 'Doctor is not available at this new time' 
        });
      }

      if (req.body.date) appointment.date = req.body.date;
      if (req.body.time) appointment.time = req.body.time;
    }

    // تحديث الملاحظات
    if (req.body.notes) {
      appointment.notes = req.body.notes;
    }

    await appointment.save();

    await NotificationService.sendPushNotification(
      appointment.patientId,
      'Appointment Update',
      `Your appointment has been ${appointment.status}`
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
};
