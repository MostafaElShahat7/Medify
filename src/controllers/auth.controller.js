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

      // Check if the email already exists in the doctor's form.
      const existingDoctor = await Doctor.findOne({ email: userData.email });
      if (existingDoctor) {
          return res.status(400).json({ message: 'Email is already in use ' });
      }
      // Check if the email already exists in the patient's form.
      const existingPatient = await Patient.findOne({ email: userData.email });
      if (existingPatient) {
          return res.status(400).json({ message: 'Email is already in use ' });
      }
      // Check if the username already exists in the doctor's form.
      const existingDoctorUsername = await Doctor.findOne({ username: userData.username });
      if (existingDoctorUsername) {
          return res.status(400).json({ message: 'Username is already in use ' });
      }
      // Check if the username already exists in the patient's form.
      const existingPatientUsername = await Patient.findOne({ username: userData.username });
      if (existingPatientUsername) {
          return res.status(400).json({ message: 'Username is already in use ' });
      }
      // Create the user
      const user = new Model(userData);
      await user.save();
      // Generate the token
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

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Save OTP to user
    user.otp = {
      code: otp,
      expiresAt: otpExpiresAt
    };
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      "Medify – Verification Code",
      `Hello,

We've received a request to sign in to your Medify account.
To complete the process, please enter the verification code below:

Your Code: ${otp}
Note: This code is valid for 10 minutes only.

Security Reminder:
For your protection, do not share this code with anyone, including Medify support staff.
If you didn't request this code, you can safely ignore this message — no changes have been made to your account.

Thank you for choosing Medify.
Your health, your control.`
    );

    res.json({ 
      message: "OTP sent to your email",
      email: email,
      role: role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;
    const Model = getModel(role);

    // Find user
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // Clear OTP after successful password reset
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
