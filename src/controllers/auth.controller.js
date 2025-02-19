const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
const { sendEmail } = require("../utils/email.util");

const getModel = (role) => {
  switch (role.toLowerCase()) {
    case "admin":
      return Admin;
    case "doctor":
      return Doctor;
    case "patient":
      return Patient;
    default:
      throw new Error("Invalid role");
  }
};

const register = async (req, res) => {
  try {
      const { role, ...userData } = req.body;
      const Model = getModel(role);

      // تحقق مما إذا كان البريد الإلكتروني موجودًا بالفعل في نموذج الدكتور
      const existingDoctor = await Doctor.findOne({ email: userData.email });
      if (existingDoctor) {
          return res.status(400).json({ message: 'Email is already in use ' });
      }

      // تحقق مما إذا كان البريد الإلكتروني موجودًا بالفعل في نموذج المريض
      const existingPatient = await Patient.findOne({ email: userData.email });
      if (existingPatient) {
          return res.status(400).json({ message: 'Email is already in use ' });
      }

      // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل في نموذج الدكتور
      const existingDoctorUsername = await Doctor.findOne({ username: userData.username });
      if (existingDoctorUsername) {
          return res.status(400).json({ message: 'Username is already in use ' });
      }

      // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل في نموذج المريض
      const existingPatientUsername = await Patient.findOne({ username: userData.username });
      if (existingPatientUsername) {
          return res.status(400).json({ message: 'Username is already in use ' });
      }

      // // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل
      // const existingUser = await Model.findOne({
      //     $or: [{ username: userData.username }],
      // });

      // if (existingUser) {
      //     return res.status(400).json({ message: 'Username already exists' });
      // }

      // إنشاء المستخدم
      const user = new Model(userData);
      await user.save();

      // توليد التوكن
      const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.status(201).json({
          message: "Registration successful",
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role,
          },
      });
  } catch (error) {
      console.error("================================================================================");
      console.error(error);
      console.error("================================================================================");

      res.status(500).json({
          message: "Registration failed. Please try again.",
          error,
      });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const Model = getModel(role);

    // Find user
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email, role } = req.body;
    const Model = getModel(role);

    // Find user
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Save reset token hash
    user.resetToken = resetToken;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      "Password Reset Request",
      `Click the following link to reset your password: ${resetUrl}`
    );

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = getModel(decoded.role);

    // Find user
    const user = await Model.findById(decoded.id);
    if (!user || user.resetToken !== token) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
